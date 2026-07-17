"""Cook Assistant — Instagram recipe import service."""

from __future__ import annotations

import os
import time
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from pipeline import PipelineError, run_pipeline

load_dotenv()

app = FastAPI(title="Cook Assistant Import Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

PIPELINE_TIMEOUT_S = 45


class ImportRequest(BaseModel):
    url: str = Field(min_length=8)


def _error(code: str, message: str, status: int, raw_caption: str | None = None) -> JSONResponse:
    body: dict[str, Any] = {"error": {"code": code, "message": message}}
    if raw_caption:
        body["error"]["raw_caption"] = raw_caption
    return JSONResponse(status_code=status, content=body)


def _require_secret(x_import_secret: str | None) -> None:
    expected = os.environ.get("IMPORT_SHARED_SECRET", "")
    if not expected or x_import_secret != expected:
        raise HTTPException(status_code=401, detail="unauthorized")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/import")
def import_recipe(
    body: ImportRequest,
    x_import_secret: str | None = Header(default=None, alias="X-Import-Secret"),
) -> Any:
    try:
        _require_secret(x_import_secret)
    except HTTPException:
        return _error("unauthorized", "Secret manquant ou invalide", 401)

    started = time.monotonic()
    try:
        result = run_pipeline(body.url.strip())
        if time.monotonic() - started > PIPELINE_TIMEOUT_S:
            return _error("timeout", "Pipeline trop long", 504)
        return result
    except PipelineError as exc:
        status_map = {
            "invalid_url": 422,
            "content_unavailable": 404,
            "download_failed": 502,
            "extraction_failed": 502,
            "timeout": 504,
            "internal_error": 500,
        }
        return _error(
            exc.code,
            exc.message,
            status_map.get(exc.code, 500),
            raw_caption=exc.raw_caption,
        )
    except TimeoutError:
        return _error("timeout", "Pipeline trop long", 504)
    except Exception:
        return _error("internal_error", "Erreur inattendue", 500)


@app.middleware("http")
async def soft_timeout_header(request: Request, call_next):
    response = await call_next(request)
    return response
