---
title: Budan's Brew project
source: https://github.com/yadavabhishekz/budans-brew
---

## Budan's Brew: multi-agent coffee shop customer service
An AI-powered customer service chatbot for a coffee shop mobile app. It takes orders, answers detailed menu questions (ingredients, allergens), recommends complementary products, and blocks irrelevant or harmful queries. Built as a multi-agent system, not a single chatbot, using Llama 3.1 8B Instruct served on RunPod. There's a demo video on Loom.

## Budan's Brew agent architecture
Five specialized agents work in a pipeline:
1. Guard Agent: the first line of defense; blocks inappropriate, harmful, or irrelevant messages before anything else runs.
2. Classification Agent: works out the user's intent and routes to the right agent.
3. Details Agent (RAG): embeds the question, retrieves the closest menu and FAQ entries from Pinecone, and answers grounded in them.
4. Order Taking Agent: walks the customer through an order step by step using chain-of-thought prompting, so the final order is accurate and structured.
5. Recommendation Agent: suggests complementary items, triggered by the Order Taking Agent near the end of an order to upsell.

An AgentController runs the guard check first, then classification, then dispatches to the chosen agent.

## Budan's Brew recommendation engine
Market basket analysis using the Apriori algorithm, trained on a Kaggle coffee shop sales dataset. It gives "customers who bought X also bought Y" recommendations, with a popularity-based fallback by product category.

## Budan's Brew deployment and app
The Python agent API is containerized with Docker and deployed on RunPod GPU infrastructure, and embeddings are also served from RunPod. Product data lives in Firebase. I designed and built the AI and backend: the agents, the RAG pipeline, the recommendation engine, and the API. The React Native mobile app (landing, home, item details, cart, and chatbot screens) was built by a friend.

## What I learned from Budan's Brew
Serving LLMs on cloud GPUs, designing multi-agent systems with safety guardrails, building RAG pipelines on a vector database, integrating a recommendation engine into a conversational order flow, and managing conversational context for a real business workflow.

## Budan's Brew tech stack
Llama 3.1 8B Instruct, RunPod, Pinecone, RAG, Apriori market basket analysis, Python, Docker, Firebase, React Native.
