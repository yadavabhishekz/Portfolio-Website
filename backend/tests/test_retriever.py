"""Retriever: knowledge loading, BM25 ranking, and small-to-big expansion."""

import retriever


def test_knowledge_base_loads():
    assert {"about", "experience", "skills", "this-site"} <= set(retriever.DOCUMENTS)
    for doc in retriever.DOCUMENTS.values():
        assert doc.title and doc.source and doc.body
    assert len(retriever.CHUNKS) > len(retriever.DOCUMENTS)


def test_specific_question_finds_its_project():
    top = retriever.retrieve("how does RECAP handle hinglish")[0]
    assert top.doc.id == "project-recap"
    assert retriever.retrieve("do you know MCP")[0].doc.id == "project-job-recommender"
    assert retriever.retrieve("text to sql")[0].doc.id == "project-ai-data-analyst"


def test_small_talk_and_off_topic_retrieve_nothing():
    assert retriever.retrieve("hi") == []
    assert retriever.retrieve("what is the capital of france") == []


def test_parent_document_expansion():
    # The question says "Llama"/"GPU" but the figures live in a different chunk
    # of the same document; expansion must still bring in the whole document.
    docs = retriever.retrieve_documents("How did you fit Llama 3 8B fine-tuning into a small GPU?")
    series = next(d for d in docs if d.id == "project-series-nlp")
    assert "32 GB" in series.body and "6 GB" in series.body
    assert len(docs) <= 3


def test_sources_format():
    docs = retriever.retrieve_documents("Budan's Brew Pinecone")
    sources = retriever.sources_for(docs)
    assert sources[0] == {
        "title": "Budan's Brew project",
        "url": "https://github.com/yadavabhishekz/budans-brew",
    }
