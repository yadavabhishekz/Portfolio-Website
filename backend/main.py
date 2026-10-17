"""
FastAPI application — serves the /api/chat endpoint with LangChain + Groq,
and in production also serves the built React frontend as static files.
"""

import json
import logging
import time
from collections import OrderedDict, defaultdict
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from llm import FALLBACK_ERRORS, NoGroqKeyError, get_llms, load_keys
from prompts import build_system_prompt, build_writer_prompt
from retriever import SOURCE_MIN_SCORE, format_context, retrieve_documents_scored, sources_for
from tools import TOOLS_BY_NAME, grounding_doc

# ── Load environment ──────────────────────────────────────────────
load_dotenv()

# Keys: GROQ_API_KEY and/or GROQ_API_KEYS (comma-separated), used in rotation.
# Model: GROQ_MODEL (default openai/gpt-oss-120b) — Groq retires models over time.
if not load_keys():
    import warnings
    warnings.warn(
        "⚠️  No Groq API key found! Create backend/.env with GROQ_API_KEY=your-key. "
        "The /api/chat endpoint will return 500 until a key is set."
    )

BUSY_MESSAGE = "I'm getting a lot of questions right now — please try again in a minute."

logger = logging.getLogger("uvicorn.error")

# ── FastAPI app ───────────────────────────────────────────────────
app = FastAPI(title="AI Portfolio API")

# CORS — allow the Vite dev server in local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # so the frontend can read these custom headers
    expose_headers=["X-Tool-Name", "X-Tool-Args", "X-Sources"],
)

# ── Rate Limiting (in-memory, per-IP) ────────────────────────────
# Counts only LLM-backed requests — cached replies are free and not counted.
request_log = defaultdict(list)  # { ip_address: [timestamp, ...] }
RATE_LIMIT = 30  # requests per IP per window
WINDOW_SECONDS = 3600  # 1 hour


def _client_ip(request: Request) -> str:
    """Visitor IP. Behind Render/Railway's proxy, request.client is the proxy,
    so use the first X-Forwarded-For entry when present."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(ip: str):
    now = time.time()
    recent = [t for t in request_log[ip] if now - t < WINDOW_SECONDS]
    if len(recent) >= RATE_LIMIT:
        request_log[ip] = recent
        raise HTTPException(
            status_code=429,
            detail="You've hit the hourly message limit — please come back a bit later!",
        )
    recent.append(now)
    request_log[ip] = recent
    # Drop IPs with no recent activity so the log can't grow without bound
    if len(request_log) > 10_000:
        for stale in [k for k, v in request_log.items() if not v or now - v[-1] >= WINDOW_SECONDS]:
            del request_log[stale]


# ── Request schema ───────────────────────────────────────────────
MAX_MESSAGE_CHARS = 500
# Only the most recent turns are sent to the LLM (keeps token use bounded)
MAX_HISTORY_MESSAGES = 8


class HistoryEntry(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)
    # Tool/card shown with an assistant reply, so the LLM knows what's on screen
    card: str | None = Field(default=None, max_length=40)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)
    history: list[HistoryEntry] = Field(default=[], max_length=100)
    # True for quick-question pill clicks: answered without history, so cacheable
    quick: bool = False


# ── Reply cache (in-memory LRU) ──────────────────────────────────
# Replies that don't depend on history — quick-question pills and first
# messages — are cached, so repeat questions cost zero LLM tokens.
# They're always generated WITHOUT history, so one visitor's conversation
# can never leak into a reply cached for everyone.
REPLY_CACHE_SIZE = 128
_reply_cache = OrderedDict()  # { normalized message: {reply, tool_name, tool_args, sources} }


def _cache_key(message: str) -> str:
    return " ".join(message.lower().split())


def _cache_get(key: str):
    entry = _reply_cache.get(key)
    if entry:
        _reply_cache.move_to_end(key)
    return entry


def _cache_put(key: str, entry: dict):
    _reply_cache[key] = entry
    _reply_cache.move_to_end(key)
    while len(_reply_cache) > REPLY_CACHE_SIZE:
        _reply_cache.popitem(last=False)


def _chat_response(body, tool_name, tool_args, sources, cache_status):
    response = StreamingResponse(body, media_type="text/plain")
    response.headers["X-Tool-Name"] = tool_name or ""
    response.headers["X-Tool-Args"] = json.dumps(tool_args)
    response.headers["X-Sources"] = json.dumps(sources)
    response.headers["X-Cache"] = cache_status
    return response


def _retrieval_query(history, user_message):
    """The new message plus the previous user message, so follow-ups like
    "what database did it use?" still retrieve the project being discussed."""
    previous = next((e["content"] for e in reversed(history) if e["role"] == "user"), "")
    return f"{previous} {user_message}".strip()


def _run_tool(decision):
    """Execute the first tool call, if any.

    Returns (tool_name, tool_args, result_text); result_text is "" when no tool ran.
    """
    if not decision.tool_calls:
        return None, {}, ""

    call = decision.tool_calls[0]
    tool = TOOLS_BY_NAME.get(call["name"])
    if tool is None:
        return None, {}, ""

    try:
        result = tool.invoke(call["args"])
    except Exception:
        if call["name"] != "getProject":
            return None, {}, ""
        # Unknown project_id — fall back to the projects overview
        call = {**call, "name": "getProjects", "args": {}}
        result = TOOLS_BY_NAME["getProjects"].invoke({})

    return call["name"], call["args"], str(result)


def _reply_messages(messages, writer_prompt, tool_result, card_doc_in_context):
    """Messages for the reply call. Its system prompt has no tool instructions (the
    writer has no tools); the tool's result is appended to it instead of being sent
    as tool messages. If the card's document is already in the retrieved context,
    its reference notes are dropped to avoid sending the same document twice."""
    prompt = writer_prompt
    if tool_result:
        if card_doc_in_context:
            tool_result = tool_result.split("\n\n<reference_notes>")[0]
        prompt += (
            "\n\n═══════════════════════════════════════════════\n"
            "CARD NOW ON SCREEN (chosen for this message)\n"
            "═══════════════════════════════════════════════\n"
            f"{tool_result}"
        )
    return [SystemMessage(content=prompt)] + messages[1:]


def _build_messages(history, user_message, system_prompt):
    """Convert the chat history + new user message into LangChain message objects."""
    messages = [SystemMessage(content=system_prompt)]

    for entry in history:
        if entry["role"] == "user":
            messages.append(HumanMessage(content=entry["content"]))
        else:
            card = entry.get("card")
            if card in TOOLS_BY_NAME:
                prefix = f"[Card shown: {card}] "
                messages.append(AIMessage(content=prefix + entry["content"]))
            else:
                messages.append(AIMessage(content=entry["content"]))

    messages.append(HumanMessage(content=user_message))
    return messages


# ── Chat endpoint ────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest, request: Request):
    # ── Cache: history-free questions (served before rate limiting — they're free) ──
    history = [] if req.quick else [h.model_dump() for h in req.history[-MAX_HISTORY_MESSAGES:]]
    cache_key = _cache_key(req.message) if not history else None
    cached = _cache_get(cache_key) if cache_key else None
    if cached:
        return _chat_response(
            iter([cached["reply"]]), cached["tool_name"], cached["tool_args"],
            cached["sources"], "HIT",
        )

    # ── Rate limiting ──
    _check_rate_limit(_client_ip(request))

    # ── Get LLMs (key rotation with fallback) ──
    try:
        llm_with_tools, llm_reply = get_llms()
    except NoGroqKeyError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # ── Retrieve relevant passages (RAG) ──
    scored_docs = retrieve_documents_scored(_retrieval_query(history, req.message))
    docs = [doc for doc, _ in scored_docs]
    context = format_context(docs)
    system_prompt = build_system_prompt(context)

    # ── Build message list ──
    messages = _build_messages(history, req.message, system_prompt)

    # ── Call 1: Tool detection (non-streamed) ──
    try:
        decision = await llm_with_tools.ainvoke(messages)
    except FALLBACK_ERRORS:
        # Every key is rate-limited or unavailable
        raise HTTPException(status_code=429, detail=BUSY_MESSAGE)
    except Exception:
        raise HTTPException(status_code=500, detail="AI service error. Please try again.")

    # ── Execute the tool so its result grounds the reply ──
    tool_name, tool_args, tool_result = _run_tool(decision)
    doc = grounding_doc(tool_name, tool_args) if tool_name else None
    stream_messages = _reply_messages(
        messages, build_writer_prompt(context), tool_result, card_doc_in_context=doc in docs
    )

    # Sources shown under the reply: the card's own document first, then strong matches
    sources = sources_for([d for d, score in scored_docs if score >= SOURCE_MIN_SCORE])
    if doc:
        sources = [{"title": doc.title, "url": doc.source}] + [
            s for s in sources if s["title"] != doc.title
        ]
    elif tool_name:
        # Pure navigation cards (projects list, resume, contact) are their own source
        sources = []

    # ── Call 2: Final reply generation (streamed) ──
    async def generate():
        parts = []
        try:
            async for chunk in llm_reply.astream(stream_messages):
                if chunk.content:
                    parts.append(chunk.content)
                    yield chunk.content
        except Exception as e:
            logger.warning("Reply stream failed: %s: %s", type(e).__name__, str(e)[:300])
            yield "\n\n[Sorry, I encountered an error generating a response. Please try again.]"
            return
        # Only complete, error-free replies are cached (a client disconnect
        # stops the generator at `yield`, so partial replies never get here)
        if cache_key:
            _cache_put(cache_key, {
                "reply": "".join(parts),
                "tool_name": tool_name,
                "tool_args": tool_args,
                "sources": sources,
            })

    return _chat_response(generate(), tool_name, tool_args, sources, "MISS")


# ── Health check ─────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── Production: Serve React build ────────────────────────────────
# FastAPI's frontend support (>= 0.138.0) registers low-priority routes:
# /api/* path operations always match first, then files in dist/ (assets,
# resume.pdf, images), then index.html as the SPA fallback.
# Guarded so local dev works before `npm run build` has created dist/.
dist_path = Path(__file__).parent.parent / "frontend" / "dist"
if dist_path.exists():
    app.frontend("/", directory=dist_path)
