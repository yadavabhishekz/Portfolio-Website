"""
Routing eval — does the LLM open the right card for realistic questions?

Runs only the tool-selection call (no reply generation) against the real
Groq model, so it costs ~2k tokens per question. Run manually:

    python eval_routing.py
"""

import asyncio
import time

from dotenv import load_dotenv

load_dotenv()

from main import _build_messages  # noqa: E402
from llm import get_llms  # noqa: E402
from prompts import build_system_prompt  # noqa: E402
from retriever import format_context, retrieve_documents  # noqa: E402

# (question, expected tool, expected args) — None means "answer in text, no card"
CASES = [
    ("Tell me about yourself", "getPresentation", {}),
    ("who are you?", "getPresentation", {}),
    ("Show me your projects", "getProjects", {}),
    ("what have you built?", "getProjects", {}),
    ("Tell me about RECAP", "getProject", {"project_id": "recap"}),
    ("explain the meeting assistant you made", "getProject", {"project_id": "recap"}),
    ("How does Budan's Brew work?", "getProject", {"project_id": "budans-brew"}),
    ("show me the naruto project", "getProject", {"project_id": "series-nlp"}),
    ("what's the job recommender?", "getProject", {"project_id": "job-recommender"}),
    ("tell me about your text-to-SQL app", "getProject", {"project_id": "ai-data-analyst"}),
    ("What are your skills?", "getSkills", {}),
    ("which tech stack do you know?", "getSkills", {}),
    ("Tell me about your work experience", "getExperience", {}),
    ("where do you work?", "getExperience", {}),
    ("Can I see your resume?", "getResume", {}),
    ("download CV", "getResume", {}),
    ("How can I contact you?", "getContact", {}),
    ("How does this site work?", "getHowItWorks", {}),
    ("hi", None, {}),
    ("what's the capital of France?", None, {}),
]


# Follow-ups: a question about the card already on screen gets text, not the same card again
_RECAP = [
    {"role": "user", "content": "Tell me about RECAP"},
    {"role": "assistant", "content": "RECAP turns meetings into reports!", "card": "getProject"},
]
_SKILLS = [
    {"role": "user", "content": "What are your skills?"},
    {"role": "assistant", "content": "Here are my skills!", "card": "getSkills"},
]
FOLLOW_UPS = [
    (_RECAP, "what embeddings does it use?", None, {}),
    (_SKILLS, "do you know LangGraph?", None, {}),
    (_RECAP, "cool, now show me your experience", "getExperience", {}),
]


async def route(question, history=()):
    llm_with_tools, _ = get_llms()
    previous = next((e["content"] for e in reversed(history) if e["role"] == "user"), "")
    docs = retrieve_documents(f"{previous} {question}".strip())
    messages = _build_messages(list(history), question, build_system_prompt(format_context(docs)))
    decision = await llm_with_tools.ainvoke(messages)
    model = decision.response_metadata.get("model_name", "?")
    if not decision.tool_calls:
        return None, {}, model
    call = decision.tool_calls[0]
    return call["name"], call["args"], model


async def main():
    cases = [([], q, t, a) for q, t, a in CASES] + FOLLOW_UPS
    passed, models = 0, {}
    for history, question, want_tool, want_args in cases:
        tool, args, model = await route(question, history)
        models[model] = models.get(model, 0) + 1
        ok = tool == want_tool and (not want_args or args == want_args)
        passed += ok
        got = f"{tool}({args})" if args else str(tool)
        label = f"(follow-up) {question}" if history else question
        print(f"{'PASS' if ok else 'FAIL'}  {label:<46} -> {got}  [{model}]")
        time.sleep(3)  # stay under free-tier tokens-per-minute limits
    print(f"\nRouting accuracy: {passed}/{len(cases)} ({passed / len(cases):.0%})")
    print(f"Models that answered: {models}")


if __name__ == "__main__":
    asyncio.run(main())
