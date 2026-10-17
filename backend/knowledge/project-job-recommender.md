---
title: AI Job Recommender project
source: https://github.com/yadavabhishekz/AI-Powered-Job-Recommender-System
---

## AI-powered job recommender
Upload a resume PDF and the app summarizes it, finds skill gaps, suggests a career roadmap, and then pulls matching live job listings from LinkedIn and Naukri.

## Job recommender pipeline
1. Text extraction from the uploaded PDF with PyMuPDF.
2. Three LLM analyses via Groq (openai/gpt-oss-120b): a resume summary (skills, education, experience), skill gaps (missing skills, certifications, experience), and a future roadmap.
3. The LLM turns the summary into a comma-separated list of job titles and search keywords.
4. Those keywords drive Apify scraper actors that fetch up to 60 jobs each from LinkedIn and Naukri (India), shown with title, company, location, and a direct link.

## Job recommender MCP server
I also exposed the job-fetching functions as tools on an MCP (Model Context Protocol) server built with FastMCP over stdio, so any MCP-compatible AI client or agent can search LinkedIn and Naukri jobs directly.

## Job recommender tech stack
Python, Streamlit, Groq (gpt-oss-120b), PyMuPDF, Apify, MCP (FastMCP), uv.
