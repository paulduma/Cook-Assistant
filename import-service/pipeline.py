"""yt-dlp → ffmpeg (3 frames) → Claude Haiku vision → structured recipe JSON."""

from __future__ import annotations

import base64
import json
import os
import re
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

import anthropic

INSTAGRAM_URL_RE = re.compile(
    r"^https?://(www\.)?(instagram\.com|instagr\.am)/(p|reel|reels|tv)/[A-Za-z0-9_-]+/?",
    re.IGNORECASE,
)

EXTRACTION_PROMPT = """Tu extrais une recette de cuisine depuis une vidéo Instagram (frames + légende).

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de commentaire) au format :
{
  "title": "string",
  "confidence": "high" | "medium" | "low",
  "servings": "string ou null",
  "prep_time": "string ou null",
  "cook_time": "string ou null",
  "ingredients": [{"quantity": "string ou null", "item": "string"}],
  "steps": ["string", "..."],
  "missing_info": ["string", "..."],
  "source_caption_used": true | false
}

Règles :
- Si une info est absente ou incertaine, mets null / liste vide et ajoute une entrée dans missing_info.
- confidence = low si beaucoup d'infos manquent ou si tu improvises.
- Les quantités restent en français si présentes dans la légende/vidéo.
- Ne invente pas d'ingrédients absents des frames/légende ; préfère missing_info.
"""


class PipelineError(Exception):
    def __init__(self, code: str, message: str, raw_caption: str | None = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.raw_caption = raw_caption


def is_valid_instagram_url(url: str) -> bool:
    return bool(INSTAGRAM_URL_RE.match(url.strip()))


def _run(cmd: list[str], timeout: int) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        timeout=timeout,
        check=False,
    )


def download_with_ytdlp(url: str, work_dir: Path) -> tuple[Path, str]:
    """Download video + metadata; return (video_path, caption)."""
    out_tmpl = str(work_dir / "video.%(ext)s")
    meta_path = work_dir / "meta.json"

    result = _run(
        [
            "yt-dlp",
            "--no-playlist",
            "--write-info-json",
            "-o",
            out_tmpl,
            "--",
            url,
        ],
        timeout=90,
    )

    if result.returncode != 0:
        stderr = (result.stderr or "").lower()
        if any(
            token in stderr
            for token in ("private", "login required", "unavailable", "not available", "404")
        ):
            raise PipelineError(
                "content_unavailable",
                "Impossible d’accéder à ce contenu",
            )
        raise PipelineError("download_failed", "Échec du téléchargement yt-dlp")

    videos = list(work_dir.glob("video.*"))
    videos = [p for p in videos if p.suffix.lower() not in {".json", ".info.json"}]
    # yt-dlp writes video.info.json alongside
    info_files = list(work_dir.glob("*.info.json"))
    if not videos:
        raise PipelineError("download_failed", "Aucune vidéo téléchargée")

    video_path = videos[0]
    caption = ""
    info_file = info_files[0] if info_files else meta_path
    if info_file.exists():
        try:
            meta = json.loads(info_file.read_text(encoding="utf-8"))
            caption = (
                meta.get("description")
                or meta.get("title")
                or meta.get("fulltitle")
                or ""
            )
        except (json.JSONDecodeError, OSError):
            caption = ""

    return video_path, caption.strip()


def extract_frames(video_path: Path, work_dir: Path, count: int = 3) -> list[Path]:
    probe = _run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_path),
        ],
        timeout=30,
    )
    try:
        duration = float((probe.stdout or "0").strip() or "0")
    except ValueError:
        duration = 0.0

    if duration <= 0:
        duration = 10.0

    timestamps = [duration * (i + 1) / (count + 1) for i in range(count)]
    frames: list[Path] = []
    for i, ts in enumerate(timestamps):
        out = work_dir / f"frame_{i}.jpg"
        result = _run(
            [
                "ffmpeg",
                "-y",
                "-ss",
                f"{ts:.2f}",
                "-i",
                str(video_path),
                "-frames:v",
                "1",
                "-q:v",
                "2",
                str(out),
            ],
            timeout=30,
        )
        if result.returncode != 0 or not out.exists():
            raise PipelineError("download_failed", "Échec de l’extraction des frames")
        frames.append(out)
    return frames


def _image_block(path: Path) -> dict[str, Any]:
    data = base64.standard_b64encode(path.read_bytes()).decode("ascii")
    return {
        "type": "image",
        "source": {
            "type": "base64",
            "media_type": "image/jpeg",
            "data": data,
        },
    }


def _parse_recipe_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    data = json.loads(cleaned)
    if not isinstance(data, dict):
        raise ValueError("root is not an object")
    if "title" not in data or "ingredients" not in data or "steps" not in data:
        raise ValueError("missing required keys")
    return data


def call_claude(
    frames: list[Path],
    caption: str,
    source_url: str,
) -> dict[str, Any]:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise PipelineError("internal_error", "ANTHROPIC_API_KEY manquante")

    model = os.environ.get("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")
    client = anthropic.Anthropic(api_key=api_key)

    content: list[dict[str, Any]] = [_image_block(p) for p in frames]
    content.append(
        {
            "type": "text",
            "text": (
                f"URL source: {source_url}\n\n"
                f"Légende Instagram:\n{caption or '(aucune légende)'}\n\n"
                f"{EXTRACTION_PROMPT}"
            ),
        }
    )

    last_error: Exception | None = None
    for _attempt in range(2):
        try:
            message = client.messages.create(
                model=model,
                max_tokens=2048,
                messages=[{"role": "user", "content": content}],
            )
            text_parts = [
                block.text for block in message.content if getattr(block, "type", None) == "text"
            ]
            raw_text = "\n".join(text_parts)
            data = _parse_recipe_json(raw_text)
            data["source_url"] = source_url
            data.setdefault("missing_info", [])
            data.setdefault("confidence", "medium")
            data.setdefault("servings", None)
            data.setdefault("prep_time", None)
            data.setdefault("cook_time", None)
            data.setdefault("source_caption_used", bool(caption))
            return data
        except (json.JSONDecodeError, ValueError, anthropic.APIError) as exc:
            last_error = exc
            continue

    raise PipelineError(
        "extraction_failed",
        "JSON LLM invalide après retry",
        raw_caption=caption or None,
    ) from last_error


def run_pipeline(url: str) -> dict[str, Any]:
    if not is_valid_instagram_url(url):
        raise PipelineError("invalid_url", "URL Instagram invalide")

    work_dir = Path(tempfile.mkdtemp(prefix="cook-import-"))
    try:
        video_path, caption = download_with_ytdlp(url, work_dir)
        frames = extract_frames(video_path, work_dir)
        return call_claude(frames, caption, url.strip())
    finally:
        shutil.rmtree(work_dir, ignore_errors=True)
