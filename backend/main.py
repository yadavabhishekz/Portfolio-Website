"""
FastAPI application — serves the /api/chat endpoint with LangChain + Groq,
and in production also serves the built React frontend as static files.
"""

import os
import time
from collections import defaultdict
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from prompts import SYSTEM_PROMPT
from tools import ALL_TOOLS, TOOL_CAPTIONS

# ── Load environment ──────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    import warnings
    warnings.warn(
        "⚠️  GROQ_API_KEY not found! Create backend/.env with GROQ_API_KEY=your-key. "
        "The /api/chat endpoint will return 500 until the key is set."
    )

# ── FastAPI app ───────────────────────────────────────────────────
app = FastAPI(title="AI Portfolio API")

# CORS — allow the Vite dev server in local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Tool-Name"],  # so the frontend can read this custom header
)

# ── Rate Limiting (in-memory, per-IP) ────────────────────────────
request_log = defaultdict(list)  # { ip_address: [timestamp, ...] }
RATE_LIMIT = 999999  # TODO: restore to 20 before deploying
WINDOW_SECONDS = 3600  # 1 hour


# ── Request schema ───────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: list = []


# ── LLM setup (lazy — allows server to start without key for frontend dev) ──
_llm = None
_llm_with_tools = None


def _get_llm():
    global _llm, _llm_with_tools
    if _llm is None:
        if not GROQ_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="GROQ_API_KEY is not configured. Set it in backend/.env",
            )
        _llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=GROQ_API_KEY,
            temperature=0.7,
        )
        _llm_with_tools = _llm.bind_tools(ALL_TOOLS)
    return _llm, _llm_with_tools


def _build_messages(history, user_message):
    """Convert the chat history + new user message into LangChain message objects."""
    messages = [SystemMessage(content=SYSTEM_PROMPT)]

    for entry in history:
        role = entry.get("role", "")
        content = entry.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=user_message))
    return messages


# ── Chat endpoint ────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest, request: Request):
    # ── Rate limiting ──
    ip = request.client.host
    now = time.time()
    request_log[ip] = [t for t in request_log[ip] if now - t < WINDOW_SECONDS]

    if len(request_log[ip]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Rate limit reached. Please try again later.",
        )

    request_log[ip].append(now)

    # ── Get LLM (lazy init) ──
    llm, llm_with_tools = _get_llm()

    # ── Build message list ──
    messages = _build_messages(req.history, req.message)

    # ── Call 1: Tool detection (non-streamed) ──
    try:
        decision = await llm_with_tools.ainvoke(messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

    tool_name = None
    if decision.tool_calls:
        tool_name = decision.tool_calls[0]["name"]

    # ── Call 2: Final reply generation (streamed) ──
    # If a tool was matched, append context so the model knows the card is shown
    stream_messages = list(messages)  # copy
    if tool_name and tool_name in TOOL_CAPTIONS:
        caption = TOOL_CAPTIONS[tool_name]
        stream_messages.append(AIMessage(content=f"[Called {tool_name}]"))
        stream_messages.append(
            HumanMessage(
                content=(
                    f"Tool result shown to user: {caption}. "
                    "Respond naturally and briefly, without repeating this information. "
                    "Do not list projects, skills, or contact details — the card already shows them."
                )
            )
        )

    async def generate():
        try:
            async for chunk in llm.astream(stream_messages):
                if chunk.content:
                    yield chunk.content
        except Exception:
            yield "\n\n[Sorry, I encountered an error generating a response. Please try again.]"

    response = StreamingResponse(generate(), media_type="text/plain")
    response.headers["X-Tool-Name"] = tool_name or ""
    response.headers["Access-Control-Expose-Headers"] = "X-Tool-Name"
    return response


# ── Health check ─────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── Production: Serve React build ────────────────────────────────
# This must be mounted AFTER the API routes so /api/* takes priority
dist_path = Path(__file__).parent.parent / "frontend" / "dist"
if dist_path.exists():
    # Serve the assets directory (JS, CSS, images built by Vite)
    assets_path = dist_path / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # Catch-all: serve index.html for any non-API route (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if the requested file exists in dist (e.g., favicon, robots.txt)
        file_path = dist_path / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        # Otherwise, serve index.html for client-side routing
        return FileResponse(str(dist_path / "index.html"))
