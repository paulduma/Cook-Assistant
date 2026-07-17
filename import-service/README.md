# Cook Assistant — Instagram recipe import service
#
# Local run:
#   cd import-service
#   python -m venv .venv && source .venv/bin/activate
#   pip install -r requirements.txt
#   cp .env.example .env   # fill ANTHROPIC_API_KEY + IMPORT_SHARED_SECRET
#   uvicorn main:app --reload --port 8000
#
# Deploy: build this Dockerfile on Railway / Fly / Render (always-on preferred).
# Requires system packages: ffmpeg + yt-dlp (installed in the Dockerfile).

## Endpoints

- `GET /health` → `{ "status": "ok" }`
- `POST /import` + header `X-Import-Secret` + body `{ "url": "<instagram url>" }`
