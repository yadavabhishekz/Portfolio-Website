"""
Lightweight BM25 retriever over the Markdown files in backend/knowledge/.

Each file starts with a small front-matter header (title, source) and is split
into chunks at "## " headings. The corpus is tiny and keyword-heavy (project
and model names), so a pure-Python BM25 index built once at import time is
precise, instant to build, and adds no memory. A local embedding model was
measured at ~500 MB extra RAM and ~9 s cold start — too much for a 512 MB
free hosting tier.

Generic questions ("tell me about yourself") are covered by the routing tools
instead: each card tool returns its knowledge document as the tool result.
"""

import math
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

KNOWLEDGE_DIR = Path(__file__).parent / "knowledge"

# BM25 parameters (standard defaults)
K1 = 1.5
B = 0.75

# Chunks scoring below this are treated as noise (e.g. for "hi" or off-topic questions)
MIN_SCORE = 2.0
# Keep only chunks scoring at least this fraction of the best match
RELATIVE_CUTOFF = 0.35
# Documents are shown as "Sources" under a reply only above this (stricter) score —
# weak keyword matches still go into the prompt, but aren't presented as evidence
SOURCE_MIN_SCORE = 3.0

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "could", "did", "do",
    "does", "for", "from", "had", "has", "have", "he", "her", "his", "how", "i", "if", "in",
    "into", "is", "it", "its", "me", "more", "my", "of", "on", "or", "our", "s", "she",
    "show", "so", "tell", "than", "that", "the", "their", "them", "then", "there", "these",
    "they", "this", "to", "us", "was", "we", "were", "what", "when", "where", "which", "who",
    "why", "will", "with", "would", "you", "your", "about", "any", "some", "please", "give",
}


@dataclass
class Document:
    id: str
    title: str
    source: str
    body: str


@dataclass
class Chunk:
    doc: Document
    heading: str
    text: str
    tokens: list = field(repr=False)


def tokenize(text: str) -> list:
    """Lowercase, split on non-alphanumerics, drop stopwords, crude plural stemming."""
    tokens = []
    for tok in re.findall(r"[a-z0-9]+", text.lower()):
        if tok in STOPWORDS:
            continue
        if len(tok) > 3 and tok.endswith("s") and not tok.endswith("ss"):
            tok = tok[:-1]
        tokens.append(tok)
    return tokens


def _parse_file(path: Path) -> Document:
    raw = path.read_text(encoding="utf-8")
    meta, body = {}, raw
    if raw.startswith("---"):
        _, header, body = raw.split("---", 2)
        for line in header.strip().splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    return Document(
        id=path.stem,
        title=meta.get("title", path.stem),
        source=meta.get("source", ""),
        body=body.strip(),
    )


def _split_chunks(doc: Document) -> list:
    chunks = []
    for section in re.split(r"^## ", doc.body, flags=re.MULTILINE):
        section = section.strip()
        if not section:
            continue
        heading, _, text = section.partition("\n")
        # Heading and document title are indexed with the text so they boost matching
        tokens = tokenize(f"{doc.title} {heading} {text}")
        chunks.append(Chunk(doc=doc, heading=heading.strip(), text=text.strip(), tokens=tokens))
    return chunks


# ── Build the index once at import time ──────────────────────────
DOCUMENTS = {p.stem: _parse_file(p) for p in sorted(KNOWLEDGE_DIR.glob("*.md"))}
CHUNKS = [chunk for doc in DOCUMENTS.values() for chunk in _split_chunks(doc)]
_TERM_FREQS = [Counter(c.tokens) for c in CHUNKS]
_AVG_LEN = sum(len(c.tokens) for c in CHUNKS) / max(len(CHUNKS), 1)
_DOC_FREQ = Counter(term for tf in _TERM_FREQS for term in tf)


def _idf(term: str) -> float:
    n = _DOC_FREQ.get(term, 0)
    return math.log(1 + (len(CHUNKS) - n + 0.5) / (n + 0.5))


def _score(query_terms: set, idx: int) -> float:
    tf = _TERM_FREQS[idx]
    length = len(CHUNKS[idx].tokens)
    score = 0.0
    for term in query_terms:
        freq = tf.get(term, 0)
        if freq:
            score += _idf(term) * freq * (K1 + 1) / (freq + K1 * (1 - B + B * length / _AVG_LEN))
    return score


def _retrieve_scored(query: str, k: int = 4) -> list:
    """Up to k relevant (score, chunk) pairs for the query, best first."""
    query_terms = set(tokenize(query))
    if not query_terms:
        return []
    scored = sorted(
        ((_score(query_terms, i), chunk) for i, chunk in enumerate(CHUNKS)),
        key=lambda pair: pair[0],
        reverse=True,
    )
    best = scored[0][0]
    return [
        (score, chunk) for score, chunk in scored[:k]
        if score >= MIN_SCORE and score >= best * RELATIVE_CUTOFF
    ]


def retrieve(query: str, k: int = 4) -> list:
    """Return up to k relevant chunks for the query, best first (may be empty)."""
    return [chunk for _, chunk in _retrieve_scored(query, k)]


def retrieve_documents_scored(query: str, max_docs: int = 3) -> list:
    """Small-to-big retrieval: match on chunks, return (parent document, best score).

    Chunks give precise matching, but a question can use different words than
    the passage holding the answer. Each document is only a
    few hundred words, so sending the whole parent document gives the LLM every
    fact about that project at a small token cost.
    """
    best = {}
    for score, chunk in _retrieve_scored(query):
        if chunk.doc.id not in best:
            best[chunk.doc.id] = (chunk.doc, score)
    return list(best.values())[:max_docs]


def retrieve_documents(query: str, max_docs: int = 3) -> list:
    return [doc for doc, _ in retrieve_documents_scored(query, max_docs)]


def format_context(docs: list) -> str:
    """Render retrieved documents as a context block for the system prompt."""
    if not docs:
        return "(No specific passages matched this question.)"
    return "\n\n".join(f"[{doc.title}]\n{doc.body}" for doc in docs)


def sources_for(docs: list) -> list:
    return [{"title": doc.title, "url": doc.source} for doc in docs]


def get_document(doc_id: str):
    return DOCUMENTS.get(doc_id)
