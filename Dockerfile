# Single container: builds the React frontend, then serves it + the API from FastAPI.
# Works on any container host (Render, Railway, Koyeb, ...). Listens on $PORT.

# ── Stage 1: build the frontend ──────────────────────────────────
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python backend (serves /api/* and the built frontend) ──
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./
# main.py serves ../frontend/dist when it exists
COPY --from=frontend /app/frontend/dist /app/frontend/dist

EXPOSE 8000
# One worker on purpose: each extra worker loads another full copy (~250 MB)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
