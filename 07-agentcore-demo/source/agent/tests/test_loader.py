from pathlib import Path

from agent.loader import build_agent, load_system_prompt

SKILLS_DIR = Path(__file__).parent.parent / "agent" / "skills"


def test_load_system_prompt_nonempty():
    prompt = load_system_prompt()
    assert "research co-pilot" in prompt.lower()
    assert "never claim a result you did not run" in prompt.lower()


def test_build_agent_wires_skills_and_tools():
    captured = {}

    def fake_agent_factory(**kwargs):
        captured.update(kwargs)
        return object()  # stand-in Agent

    def fake_session_manager_factory(memory_id, region, session_id, actor_id):
        captured["memory_id"] = memory_id
        captured["sm_session_id"] = session_id
        captured["sm_actor_id"] = actor_id
        return f"session-manager:{memory_id}:{session_id}:{actor_id}"

    def fake_ci_tool_factory(region, code_interpreter_id=None):
        captured["ci_region"] = region
        captured["ci_id"] = code_interpreter_id
        return "ci-tool"

    build_agent(
        memory_id="mem-123",
        code_interpreter_region="us-west-2",
        session_id="sess-abc",
        code_interpreter_id="ci-xyz",
        skill_sources=[str(SKILLS_DIR)],
        agent_factory=fake_agent_factory,
        session_manager_factory=fake_session_manager_factory,
        ci_tool_factory=fake_ci_tool_factory,
    )

    assert captured["memory_id"] == "mem-123"
    assert captured["ci_region"] == "us-west-2"
    assert captured["ci_id"] == "ci-xyz"
    assert captured["sm_session_id"] == "sess-abc"
    assert captured["sm_actor_id"] == "research_copilot"  # DEFAULT_ACTOR_ID
    assert captured["session_manager"] == "session-manager:mem-123:sess-abc:research_copilot"
    assert "ci-tool" in captured["tools"]
    # two tools registered: the CI tool plus the @tool-wrapped paper tool
    assert len(captured["tools"]) == 2
    paper_tool = next(t for t in captured["tools"] if t != "ci-tool")
    # the wrapped paper tool exposes the arXiv id in its name/spec
    assert "fetch_paper" in repr(paper_tool) or "fetch_paper" == getattr(
        paper_tool, "tool_name", getattr(paper_tool, "__name__", "")
    )
    # an AgentSkills plugin is registered
    assert any(p.__class__.__name__ == "AgentSkills" for p in captured["plugins"])
    # system prompt is passed
    assert "research co-pilot" in captured["system_prompt"].lower()
