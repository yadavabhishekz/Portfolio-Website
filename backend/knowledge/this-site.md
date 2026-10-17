---
title: How this site works
source: https://github.com/yadavabhishekz/Portfolio-Website
---

## How this portfolio site works
The whole site is a chat. Each message goes to a FastAPI backend, which retrieves relevant passages about me, lets the LLM pick a UI card through tool calling, and streams back a short reply. The cards themselves are static React components, so the LLM never generates the project details you see in them.

## Retrieval in this site
My projects, experience, and skills are written up as Markdown files and split into chunks by heading. Each question is matched against those chunks with BM25 keyword ranking, then the best-matching chunks are expanded to their full parent documents (small-to-big retrieval), so a question worded differently from the passage holding the answer still gets every fact about that project. The documents are added to the prompt so answers stay grounded in what I've actually done. Card tools also return their own document as the tool result, which grounds broad questions like "tell me about yourself" that keyword search can't match.

## Why BM25 and not embeddings on this site
I measured a local embedding model (bge-small on ONNX) at about 500 MB of extra RAM and around 9 seconds of extra cold start, which doesn't fit a 512 MB free hosting tier. The corpus is small and keyword-heavy (project names, model names), so BM25 plus parent-document expansion gets the right context with zero extra memory.

## Tool calling in this site
The LLM (gpt-oss-120b on Groq) gets eight tools. Most take no arguments and simply choose which card to show: about, projects, skills, experience, resume, contact, and this how-it-works card. getProject takes a project_id argument restricted to an enum, so asking about one project opens that project's detail card directly. The tool's result (the document behind that card) is handed to the reply step, which runs with no tools at all, so it can only write text.

## Two-step generation in this site
Step one is a non-streamed call that decides which tool to use. Step two streams the reply token by token with tool use disabled, so the text appears immediately while the card renders.

## Tech stack of this site
React, Vite, Tailwind CSS, FastAPI, LangChain, Groq (gpt-oss-120b), BM25 retrieval, streaming responses, deployed as a single process with FastAPI serving the built frontend.
