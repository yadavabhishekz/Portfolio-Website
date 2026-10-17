"""
Groq client pool — one ChatGroq client per API key, used in rotation.

Each request starts at the next key (round-robin), which spreads load across
the keys' separate per-minute token budgets. If a key is rate-limited (429),
rejected (401/403), or Groq is unreachable, the request falls through to the
remaining keys via LangChain's with_fallbacks — including for streaming, where
the fallback happens before the first chunk is sent.

Keys come from GROQ_API_KEY and/or GROQ_API_KEYS (comma-separated).

Groq rate limits are per model, so after every key fails on GROQ_MODEL the
request tries every key again on GROQ_FALLBACK_MODEL (set it to "" to disable).
"""

import itertools
import os

from groq import (
    APIConnectionError,
    APIError,
    AuthenticationError,
    InternalServerError,
    PermissionDeniedError,
    RateLimitError,
)
from langchain_groq import ChatGroq

from tools import ALL_TOOLS

# Errors that mean "try the next key" rather than "this request is broken"
FALLBACK_ERRORS = (
    RateLimitError,
    AuthenticationError,
    PermissionDeniedError,
    APIConnectionError,
    InternalServerError,
)

# The streamed reply can also fail with a mid-stream APIError (e.g. gpt-oss emitting a
# tool call: "Tool choice is none, but model called a tool"). It's sporadic, so another
# key/model usually succeeds. The fallback only applies before the first chunk is sent.
WRITER_FALLBACK_ERRORS = FALLBACK_ERRORS + (APIError,)


class NoGroqKeyError(RuntimeError):
    pass


def load_keys() -> list:
    """All configured keys, de-duplicated, in order."""
    raw = [os.getenv("GROQ_API_KEY", "")] + os.getenv("GROQ_API_KEYS", "").split(",")
    keys = []
    for key in (k.strip() for k in raw):
        if key and key not in keys:
            keys.append(key)
    return keys


def _models() -> list:
    primary = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    fallback = os.getenv("GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b").strip()
    return [primary] + ([fallback] if fallback and fallback != primary else [])


# Built lazily so the server can start without keys (frontend-only dev)
_clients = None  # one list of (with_tools, reply) pairs per model, one pair per key
_rotation = itertools.count()


def _get_clients() -> list:
    global _clients
    if _clients is None:
        keys = load_keys()
        if not keys:
            raise NoGroqKeyError("No Groq API key configured. Set GROQ_API_KEY in backend/.env")
        _clients = []
        for model in _models():
            per_key = []
            for key in keys:
                # No SDK retries: a failing key falls through to the next key immediately.
                # Routing is classification, so it runs deterministically (temperature 0).
                router = ChatGroq(model=model, api_key=key, temperature=0, max_retries=0)
                # The reply call has NO tools: with tool_choice="none", gpt-oss sometimes
                # still emits a tool call and Groq rejects the request (400 tool_use_failed).
                # The card's notes reach the writer through its system prompt instead.
                writer = ChatGroq(model=model, api_key=key, temperature=0.7, max_retries=0)
                per_key.append((router.bind_tools(ALL_TOOLS), writer))
            _clients.append(per_key)
    return _clients


def get_llms():
    """(llm_with_tools, llm_reply) for one request, rotating the starting key.

    Order: every key on the primary model, then every key on the fallback model.
    """
    clients = _get_clients()
    start = next(_rotation) % len(clients[0])
    ordered = [pair for per_key in clients for pair in per_key[start:] + per_key[:start]]

    def with_fallbacks(runnables, errors):
        primary, *rest = runnables
        if not rest:
            return primary
        return primary.with_fallbacks(rest, exceptions_to_handle=errors)

    return (
        with_fallbacks([c[0] for c in ordered], FALLBACK_ERRORS),
        with_fallbacks([c[1] for c in ordered], WRITER_FALLBACK_ERRORS),
    )
