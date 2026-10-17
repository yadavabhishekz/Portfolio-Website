"""Tools: the project-id contract with the frontend, and grounding results."""

import re
from pathlib import Path

import pytest

import tools
from retriever import get_document

DATA_JS = Path(__file__).resolve().parents[2] / "frontend" / "src" / "data.js"


def _frontend_project_ids():
    source = DATA_JS.read_text(encoding="utf-8")
    projects = source[source.index("export const PROJECTS"):source.index("export const SKILLS")]
    return set(re.findall(r'^\s{4}id: "([^"]+)"', projects, flags=re.MULTILINE))


def test_project_ids_match_frontend_data():
    # getProject's enum and the frontend's PROJECTS ids must stay identical,
    # otherwise the AI can open a card the frontend can't render.
    assert set(tools.PROJECT_IDS) == _frontend_project_ids()


@pytest.mark.parametrize("project_id", tools.PROJECT_IDS)
def test_every_project_has_a_knowledge_document(project_id):
    assert get_document(f"project-{project_id}") is not None
    result = tools.getProject.invoke({"project_id": project_id})
    assert "detail card" in result and len(result) > 200


def test_unknown_project_id_is_rejected():
    with pytest.raises(Exception):
        tools.getProject.invoke({"project_id": "not-a-project"})


def test_card_tools_return_their_grounding_document():
    assert "Bharati Vidyapeeth" in tools.getPresentation.invoke({})
    assert "Barco" in tools.getExperience.invoke({})
    assert tools.grounding_doc("getProject", {"project_id": "recap"}).id == "project-recap"
    assert tools.grounding_doc("getResume", {}) is None


def test_every_tool_is_registered():
    assert set(tools.TOOLS_BY_NAME) == {t.name for t in tools.ALL_TOOLS}
    assert len(tools.ALL_TOOLS) == 8
