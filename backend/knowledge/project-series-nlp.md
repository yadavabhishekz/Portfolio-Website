---
title: Series Analysis with NLP project
source: https://github.com/yadavabhishekz/analyze_series_with_nlp
---

## NLP-powered series analysis system
An end-to-end NLP system that analyzes a TV series (Naruto) across 220+ episodes: what themes dominate, how characters are connected, what kind of jutsu a description refers to, plus a chatbot that talks like a character. Everything is wrapped in a Gradio web app.

## Series analysis components
1. Crawler: a custom Scrapy spider that collects jutsu data to build my own training dataset.
2. Theme classifier: zero-shot classification with facebook/bart-large-mnli over subtitle text, so themes can be any user-supplied list without retraining.
3. Character network: spaCy NER (en_core_web_trf) finds characters per sentence, co-occurrences become weighted edges in NetworkX, and the graph is rendered interactively with PyVis.
4. Jutsu text classifier: a fine-tuned DistilBERT (distilbert-base-uncased) classifying jutsu types.
5. Character chatbot: Llama-3-8B-Instruct fine-tuned with LoRA on character dialogue and pushed to the Hugging Face Hub.

## Series analysis engineering challenges
- Class imbalance: the jutsu classes were imbalanced about 20:1, so I trained DistilBERT on 2,920 scraped samples with a custom trainer that uses a class-weighted loss.
- Memory: fine-tuning an 8B model normally needs about 32 GB. Using 4-bit quantization (bitsandbytes) plus LoRA adapters (r=64, alpha=16) brought the footprint down to about 6 GB.
- Zero-shot themes avoid needing any labelled theme data at all.

## Series analysis tech stack
Llama 3 8B, LoRA, PEFT, bitsandbytes 4-bit quantization, DistilBERT, BART zero-shot, spaCy NER, NetworkX, PyVis, Scrapy, Hugging Face Transformers and Hub, Gradio, Python.
