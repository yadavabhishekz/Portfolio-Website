---
title: RECAP project
source: https://github.com/yadavabhishekz/RECAP
---

## RECAP: AI meeting and video assistant
Drop in a YouTube link or a local video or audio file, and RECAP turns it into a structured meeting report: summary, action items with owner and deadline, key decisions, and open questions. You can then chat with the meeting through RAG. It's live at ai-meetings-assistant.onrender.com, with a demo video on Loom.

## RECAP architecture and pipeline
1. Audio processing: yt-dlp downloads YouTube audio, pydub and ffmpeg convert it to 16 kHz mono WAV, and it is split into 10-minute chunks.
2. Transcription with two engines: Groq-hosted Whisper (whisper-large-v3-turbo) for English, and Sarvam AI (saaras:v2.5) for Hinglish, which transcribes and translates to English in one pass.
3. Summarization: a map-reduce LangChain LCEL chain over the chunked transcript using Llama 3.3-70B on Groq.
4. Structured extraction: action items, key decisions, and open or unresolved questions.
5. Indexing: the transcript is embedded with Gemini embeddings and stored in ChromaDB, one isolated collection per meeting.
6. RAG Q&A: an LCEL RAG chain behind the /meetings/{id}/ask endpoint answers questions grounded in that meeting's transcript.

## RECAP backend and frontend
FastAPI backend with endpoints to submit a YouTube URL, upload a file, poll status, ask questions, and delete a meeting. Each meeting is processed in a background thread so the API stays non-blocking, and the status moves through queued, fetching_audio, transcribing, summarizing, extracting, indexing, done. The frontend is a single-file vanilla HTML/CSS/JS app served by FastAPI itself, so the whole app runs as one process. Containerized with Docker for one-command deployment.

## RECAP engineering challenges and decisions
- Per-meeting ChromaDB collections keep answers scoped to one meeting, so retrieval doesn't leak across users or sessions.
- Sarvam's speech-to-text endpoint accepts at most 30 seconds of audio, so the transcriber automatically re-splits chunks into 25-second pieces.
- Long meetings don't fit in one prompt, so summarization uses map-reduce: each chunk is summarized independently, then combined.
- Meeting state is held in memory, a deliberate simplicity tradeoff; swapping the in-memory dict for a database is the path to persistence across restarts.

## RECAP tech stack
FastAPI, Uvicorn, Groq (Llama 3.3-70B, Whisper large v3 turbo), Sarvam AI, LangChain LCEL, Gemini embeddings, ChromaDB, yt-dlp, pydub, ffmpeg, Docker, vanilla JS.
