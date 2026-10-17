---
title: AI Data Analyst project
source: https://github.com/yadavabhishekz/ai-data-analyst
---

## AI Data Analyst: text-to-SQL
Lets someone ask a question about a database in plain English and get back real SQL-backed results, with no SQL knowledge needed. It runs entirely on local models through Ollama, so no data leaves the machine.

## AI Data Analyst pipeline
1. Schema extraction: SQLAlchemy's inspector reads every table and column from the SQLite database.
2. Text to SQL: the schema plus the user's question go into a LangChain prompt template, and a local LLM generates the SQL at temperature 0 for deterministic output.
3. Cleanup: reasoning models like DeepSeek-R1 emit <think> blocks, which are stripped with a regex before execution.
4. Execution: the query runs against SQLite and the rows are returned to a Streamlit UI.

## AI Data Analyst model choices and lessons
The default model is deepseek-r1:8b, and it's easy to swap to qwen2.5-coder:7b. Reasoning models are noticeably slower because they generate hidden reasoning, so for snappy responses a non-reasoning coder model is the better pick. Hallucinated column names are fixed by showing the schema clearly in the prompt. Running LLM-generated SQL is risky, so the next step is restricting it to read-only SELECT queries.

## AI Data Analyst tech stack
Python, LangChain, Ollama (DeepSeek-R1 8B, Qwen2.5-Coder 7B), SQLAlchemy, SQLite, Streamlit, uv.
