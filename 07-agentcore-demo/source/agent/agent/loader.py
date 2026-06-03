"""Single wiring point: build a Strands Agent with Memory + CI + Skills.

Cloud constructors are injectable so the wiring is unit-testable. Defaults
resolve the real Strands / AgentCore objects lazily (imported inside the
factory functions) so importing this module never requires AWS.
"""
import os
from pathlib import Path
from typing import Callable, Optional

from agent.tools.paper import fetch_paper

_PROMPT_PATH = Path(__file__).parent / "prompts" / "system.md"
_SKILLS_PATH = Path(__file__).parent / "skills"


def load_system_prompt() -> str:
    return _PROMPT_PATH.read_text(encoding="utf-8")


def _default_session_manager_factory(memory_id: str, region: str):
    from bedrock_agentcore.memory.integrations.strands.config import (
        AgentCoreMemoryConfig,
        RetrievalConfig,
    )
    from bedrock_agentcore.memory.integrations.strands.session_manager import (
        AgentCoreMemorySessionManager,
    )

    config = AgentCoreMemoryConfig(
        memory_id=memory_id,
        retrieval_config=RetrievalConfig(top_k=5),
    )
    return AgentCoreMemorySessionManager(config, region_name=region)


def _default_ci_tool_factory(region: str):
    from strands_tools.code_interpreter import AgentCoreCodeInterpreter

    return AgentCoreCodeInterpreter(region=region).code_interpreter


def _default_agent_factory(**kwargs):
    from strands import Agent

    return Agent(**kwargs)


def build_agent(
    memory_id: str,
    code_interpreter_region: str,
    skill_sources: Optional[list[str]] = None,
    agent_factory: Callable = _default_agent_factory,
    session_manager_factory: Callable = _default_session_manager_factory,
    ci_tool_factory: Callable = _default_ci_tool_factory,
):
    """Build and return a configured Strands Agent."""
    from strands.vended_plugins.skills import AgentSkills

    sources = skill_sources if skill_sources is not None else [str(_SKILLS_PATH)]
    skills_plugin = AgentSkills(skills=sources)

    ci_tool = ci_tool_factory(code_interpreter_region)
    session_manager = session_manager_factory(memory_id, code_interpreter_region)

    return agent_factory(
        system_prompt=load_system_prompt(),
        tools=[fetch_paper, ci_tool],
        plugins=[skills_plugin],
        session_manager=session_manager,
    )
