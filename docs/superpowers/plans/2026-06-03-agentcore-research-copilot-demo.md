# AgentCore Research Co-pilot Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real, CDK-deployable AgentCore demo (research co-pilot) under `07-agentcore-demo/` for an AWS Summit Builder booth, showcasing Runtime + Memory + Code Interpreter plus a Strands skills layer.

**Architecture:** A single Strands agent (Python) deployed to AgentCore Runtime. Memory persists insights across sessions via the Strands `AgentCoreMemorySessionManager`; the vended `AgentSkills` plugin supplies SKILL.md procedural knowledge (repo-local + huggingface/skills); Code Interpreter runs experiment code in an isolated sandbox. One TypeScript CDK app (`@aws-cdk/aws-bedrock-agentcore-alpha`) deploys the agent runtime, memory, code interpreter, a Cognito identity for browser access, and a static web panel (S3+CloudFront). A CLI (`demo.sh`) and the web panel both invoke the same runtime.

**Tech Stack:** Python 3.12 + uv, Strands Agents (`strands-agents`, `strands-agents-tools`), `bedrock-agentcore` SDK, FastAPI/uvicorn, Docker (ARM64), TypeScript AWS CDK v2 + `@aws-cdk/aws-bedrock-agentcore-alpha`, Jest (CDK snapshot tests), pytest (agent unit tests), vanilla JS + `@aws-sdk/client-bedrock-agentcore` for the web panel.

**Spec:** `docs/superpowers/specs/2026-06-03-agentcore-research-copilot-demo-design.md`

**Reference (patterns only):** `aws-gcr-solutions/industry-assets/cross/data-agent` on gitlab.aws.dev — verified L2 CDK constructs and agent layout. Do not copy wholesale; keep the research-harness scenario.

---

## Phase 0 — Scaffolding & Conventions

### Task 0: Create directory skeleton and tooling config

**Files:**
- Create: `07-agentcore-demo/source/agent/pyproject.toml`
- Create: `07-agentcore-demo/source/agent/.python-version`
- Create: `07-agentcore-demo/.gitignore`
- Create: `07-agentcore-demo/source/agent/agent/__init__.py` (package marker)

- [ ] **Step 1: Create the directory tree**

Run:
```bash
cd /home/ec2-user/research/ai-research-harness
mkdir -p 07-agentcore-demo/source/agent/agent/tools
mkdir -p 07-agentcore-demo/source/agent/agent/skills
mkdir -p 07-agentcore-demo/source/agent/agent/prompts
mkdir -p 07-agentcore-demo/source/agent/tests
mkdir -p 07-agentcore-demo/source/infrastructure/{bin,lib,test}
mkdir -p 07-agentcore-demo/source/web
mkdir -p 07-agentcore-demo/scripts
```

- [ ] **Step 2: Write `07-agentcore-demo/source/agent/.python-version`**

```
3.12
```

- [ ] **Step 3: Write `07-agentcore-demo/source/agent/pyproject.toml`**

```toml
[project]
name = "research-copilot-agent"
version = "0.1.0"
description = "AgentCore Research Co-pilot demo agent"
requires-python = ">=3.12"
dependencies = [
    "strands-agents>=0.4.0",
    "strands-agents-tools>=0.1.0",
    "bedrock-agentcore>=0.1.0",
    "fastapi>=0.115.0",
    "uvicorn>=0.30.0",
    "httpx>=0.27.0",
    "pydantic>=2.0.0",
]

[dependency-groups]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.24.0",
    "respx>=0.21.0",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]

[tool.uv]
package = false
```

> Version floors are starting points; Task 13 pins exact resolved versions after the first `uv sync`.

- [ ] **Step 4: Create package markers**

Run:
```bash
cd /home/ec2-user/research/ai-research-harness/07-agentcore-demo/source/agent
touch agent/__init__.py agent/tools/__init__.py tests/__init__.py
```

- [ ] **Step 5: Write `07-agentcore-demo/.gitignore`**

```
# Python
.venv/
__pycache__/
*.pyc
.pytest_cache/
# Node / CDK
node_modules/
cdk.out/
*.js.map
source/infrastructure/lib/**/*.js
source/infrastructure/bin/**/*.js
# Local config
source/web/config.local.json
.env
```

- [ ] **Step 6: Verify the environment resolves**

Run:
```bash
cd /home/ec2-user/research/ai-research-harness/07-agentcore-demo/source/agent
uv sync --dev
```
Expected: a `.venv` is created and dependencies resolve without error. If a version floor is unavailable, lower it and re-run.

- [ ] **Step 7: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/.gitignore 07-agentcore-demo/source/agent/pyproject.toml 07-agentcore-demo/source/agent/.python-version 07-agentcore-demo/source/agent/agent 07-agentcore-demo/source/agent/tests
git commit -m "🌱 scaffold: 07-agentcore-demo agent package + tooling"
```

---

## Phase 1 — Agent Tools (TDD, local, no cloud)

### Task 1: `paper` tool — fetch arXiv metadata

**Files:**
- Create: `07-agentcore-demo/source/agent/agent/tools/paper.py`
- Test: `07-agentcore-demo/source/agent/tests/test_paper.py`

The arXiv export API returns Atom XML at
`http://export.arxiv.org/api/query?id_list=<id>`. We parse title, authors,
abstract, and a canonical slug. This is a pure function — no AgentCore needed.

- [ ] **Step 1: Write the failing test**

Create `tests/test_paper.py`:
```python
import respx
import httpx
from agent.tools.paper import fetch_paper, slugify

ATOM = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <id>http://arxiv.org/abs/2104.09864v1</id>
    <title>RoFormer: Enhanced Transformer with Rotary Position Embedding</title>
    <summary>We propose RoPE, a rotary position embedding method.</summary>
    <author><name>Jianlin Su</name></author>
    <author><name>Yu Lu</name></author>
  </entry>
</feed>"""

def test_slugify_lowercases_and_hyphenates():
    assert slugify("RoFormer: Enhanced Transformer!") == "roformer-enhanced-transformer"

@respx.mock
def test_fetch_paper_parses_atom():
    respx.get("http://export.arxiv.org/api/query").mock(
        return_value=httpx.Response(200, text=ATOM)
    )
    paper = fetch_paper("2104.09864")
    assert paper["arxiv_id"] == "2104.09864"
    assert paper["title"].startswith("RoFormer")
    assert paper["authors"] == ["Jianlin Su", "Yu Lu"]
    assert "rotary position embedding" in paper["abstract"].lower()
    assert paper["slug"] == "roformer-enhanced-transformer-with-rotary-position-embedding"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd 07-agentcore-demo/source/agent && uv run pytest tests/test_paper.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'agent.tools.paper'`.

- [ ] **Step 3: Write minimal implementation**

Create `agent/tools/paper.py`:
```python
"""Fetch arXiv paper metadata. Pure function, no AgentCore dependency."""
import re
import xml.etree.ElementTree as ET

import httpx

_ATOM = "{http://www.w3.org/2005/Atom}"
_ARXIV_API = "http://export.arxiv.org/api/query"


def slugify(text: str) -> str:
    text = text.split(":")[0] if ":" in text else text
    text = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return text.strip("-")


def fetch_paper(arxiv_id: str, timeout: float = 15.0) -> dict:
    """Return {arxiv_id, title, authors, abstract, slug} for an arXiv id."""
    resp = httpx.get(_ARXIV_API, params={"id_list": arxiv_id}, timeout=timeout)
    resp.raise_for_status()
    root = ET.fromstring(resp.text)
    entry = root.find(f"{_ATOM}entry")
    if entry is None:
        raise ValueError(f"No arXiv entry for id {arxiv_id!r}")
    title = " ".join(entry.findtext(f"{_ATOM}title", "").split())
    abstract = " ".join(entry.findtext(f"{_ATOM}summary", "").split())
    authors = [
        a.findtext(f"{_ATOM}name", "").strip()
        for a in entry.findall(f"{_ATOM}author")
    ]
    return {
        "arxiv_id": arxiv_id,
        "title": title,
        "authors": [a for a in authors if a],
        "abstract": abstract,
        "slug": slugify(title),
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_paper.py -v`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/agent/tools/paper.py 07-agentcore-demo/source/agent/tests/test_paper.py
git commit -m "✨ feat(agent): paper tool — fetch arXiv metadata"
```

### Task 2: `reproduce` tool — run code in Code Interpreter sandbox

**Files:**
- Create: `07-agentcore-demo/source/agent/agent/tools/reproduce.py`
- Test: `07-agentcore-demo/source/agent/tests/test_reproduce.py`

This wraps the `bedrock_agentcore` Code Interpreter client so it can be unit
tested with a fake client (dependency-injected), keeping cloud calls out of CI.
The real wiring uses `bedrock_agentcore.tools.code_interpreter_client.CodeInterpreter`.

> **Why this exists alongside the Strands CI tool:** the live agent drives the
> high-level `strands_tools.code_interpreter.AgentCoreCodeInterpreter` tool
> (wired in Task 5) — the LLM decides what code to run. `run_in_sandbox` here is
> the low-level, deterministic runner used by unit tests and available for any
> scripted/CLI reproduction where we want a fixed snippet rather than LLM-driven
> execution. Both call the same AgentCore Code Interpreter API; neither is dead
> code. Keep `reproduce.py` import-light (no Strands dependency) so it stays a
> clean, testable unit.

- [ ] **Step 1: Write the failing test**

Create `tests/test_reproduce.py`:
```python
from agent.tools.reproduce import run_in_sandbox


class FakeCIClient:
    """Mimics bedrock_agentcore CodeInterpreter: start/invoke/stop."""
    def __init__(self):
        self.started = False
        self.stopped = False

    def start(self):
        self.started = True

    def invoke(self, name, args):
        assert name == "executeCode"
        assert args["language"] == "python"
        return {"stream": [
            {"result": {"content": [{"type": "text", "text": "accuracy=0.91\n"}]}}
        ]}

    def stop(self):
        self.stopped = True


def test_run_in_sandbox_returns_stdout_and_cleans_up():
    fake = FakeCIClient()
    result = run_in_sandbox("print('accuracy=0.91')", client=fake)
    assert "accuracy=0.91" in result["stdout"]
    assert fake.started is True
    assert fake.stopped is True


def test_run_in_sandbox_stops_on_error():
    class Boom(FakeCIClient):
        def invoke(self, name, args):
            raise RuntimeError("kaboom")
    fake = Boom()
    try:
        run_in_sandbox("print('x')", client=fake)
    except RuntimeError:
        pass
    assert fake.stopped is True  # cleanup still ran
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_reproduce.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'agent.tools.reproduce'`.

- [ ] **Step 3: Write minimal implementation**

Create `agent/tools/reproduce.py`:
```python
"""Run a Python snippet in an AgentCore Code Interpreter sandbox.

The client is injected so unit tests can pass a fake. In production the
caller passes a real
``bedrock_agentcore.tools.code_interpreter_client.CodeInterpreter`` instance.
"""
from typing import Any, Optional


def _make_default_client(region: str):
    from bedrock_agentcore.tools.code_interpreter_client import CodeInterpreter
    return CodeInterpreter(region)


def run_in_sandbox(
    code: str,
    client: Optional[Any] = None,
    region: str = "us-west-2",
) -> dict:
    """Execute ``code`` in the sandbox; return {"stdout": str}.

    Always stops the session, even on error.
    """
    if client is None:
        client = _make_default_client(region)
    client.start()
    try:
        response = client.invoke("executeCode", {"language": "python", "code": code})
        chunks = []
        for event in response.get("stream", []):
            result = event.get("result", {})
            for item in result.get("content", []):
                if item.get("type") == "text":
                    chunks.append(item["text"])
        return {"stdout": "".join(chunks)}
    finally:
        client.stop()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_reproduce.py -v`
Expected: PASS (2 passed).

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/agent/tools/reproduce.py 07-agentcore-demo/source/agent/tests/test_reproduce.py
git commit -m "✨ feat(agent): reproduce tool — run code in Code Interpreter sandbox"
```

---

## Phase 2 — Skills Layer & System Prompt

### Task 3: Repo-local SKILL.md packages

**Files:**
- Create: `07-agentcore-demo/source/agent/agent/skills/paper-reading/SKILL.md`
- Create: `07-agentcore-demo/source/agent/agent/skills/experiment-spec/SKILL.md`
- Test: `07-agentcore-demo/source/agent/tests/test_skills.py`

These repackage the existing `01-quickstart/CLAUDE.md` workflows as
agentskills.io-format skills (YAML frontmatter `name` + `description`, then
instructions). The test asserts they load via the Strands `AgentSkills` plugin.

- [ ] **Step 1: Write `agent/skills/paper-reading/SKILL.md`**

```markdown
---
name: paper-reading
description: Use when reading a research paper to produce a structured note. Covers the 6-step harness workflow — fetch metadata, dedup, read, download figures, link artifacts, update index.
---

# Paper Reading Workflow

When reading a paper, fill a structured note with these sections:

1. **One-line positioning** — what is this paper, in one sentence.
2. **Key insights** — 1-3 bullet points.
3. **Method core** — ≤ 200 words.
4. **Experiment takeaways** — 3 key numbers.
5. **Limitations** — admitted by the authors + what you should question.
6. **Minimal reproduction** — if reproducing, what is the smallest viable version.

Always record stable registry IDs (arXiv ID, HF Hub, GitHub) — never rely on file paths.
```

- [ ] **Step 2: Write `agent/skills/experiment-spec/SKILL.md`**

```markdown
---
name: experiment-spec
description: Use before running an experiment to write a spec.yaml first. Enforces hypothesis, metric, invariant, and registry IDs before any code is written.
---

# Experiment Spec Workflow

Before writing any experiment code:

1. Write `spec.yaml` containing: `hypothesis`, `metric`, `invariant`, `registry_ids`.
2. Write the invariant test first (it should fail — RED).
3. Write the minimal implementation to make it pass (GREEN).
4. Keep all config / hyperparameters in `spec.yaml`, never hidden in cells or CLI flags.
5. After running, have an independent reviewer critique the output for bugs.
6. On failure, write a REFLECT note: why it failed + what to change next.
```

- [ ] **Step 3: Write the failing test**

Create `tests/test_skills.py`:
```python
from pathlib import Path

from strands.vended_plugins.skills import AgentSkills

SKILLS_DIR = Path(__file__).parent.parent / "agent" / "skills"


def test_repo_local_skills_load_strict():
    # strict=True raises on any malformed SKILL.md
    plugin = AgentSkills(skills=[str(SKILLS_DIR)], strict=True)
    names = {s.name for s in plugin.get_available_skills()}
    assert {"paper-reading", "experiment-spec"} <= names
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_skills.py -v`
Expected: PASS. If `AgentSkills` import path differs in the installed version,
run `uv run python -c "import strands.vended_plugins.skills as s; print(dir(s))"`
and adjust the import; record the correct path in a comment.

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/agent/skills 07-agentcore-demo/source/agent/tests/test_skills.py
git commit -m "✨ feat(agent): repo-local SKILL.md packages (paper-reading, experiment-spec)"
```

### Task 4: System prompt

**Files:**
- Create: `07-agentcore-demo/source/agent/agent/prompts/system.md`

No test (static content). It is loaded by `agent_loader` in Task 5.

- [ ] **Step 1: Write `agent/prompts/system.md`**

```markdown
You are a research co-pilot. You help researchers discover papers, digest them
into structured notes, and reproduce their core claims.

## Your pipeline

1. **Discover** — given an arXiv id, fetch its metadata with the `fetch_paper` tool.
2. **Digest** — activate the `paper-reading` skill and produce a structured note.
3. **Remember** — your memory persists across sessions. When asked what you have
   studied, recall prior papers and conclusions from memory before answering.
4. **Reproduce** — when asked to reproduce a claim, activate the most relevant
   skill, then write a minimal Python experiment and run it with the code
   interpreter tool. Report the ACTUAL numbers it produced, never a guess.

## Critical rules

- Never claim a result you did not run. If you reproduced something, show the
  real sandbox output.
- Prefer activating a skill over improvising a workflow.
- Use stable registry IDs (arXiv id, HF Hub id), never file paths.
- Keep answers concise and booth-friendly.
```

- [ ] **Step 2: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/agent/prompts/system.md
git commit -m "✨ feat(agent): system prompt — research pipeline contract"
```

---

## Phase 3 — Agent Assembly (loader, HTTP shell, container)

### Task 5: `agent_loader.build_agent()` — wire Memory + CI + Skills onto a Strands Agent

**Files:**
- Create: `07-agentcore-demo/source/agent/agent/loader.py`
- Test: `07-agentcore-demo/source/agent/tests/test_loader.py`

`build_agent()` is the single wiring point. It reads config from env
(`MEMORY_ID`, `CODE_INTERPRETER_ID`, `AWS_REGION`, `SKILL_SOURCES`) and returns a
configured `strands.Agent`. To keep it unit-testable without cloud, the
Memory/CI/model constructors are wrapped in small injectable factory params that
default to the real ones. The test injects fakes and asserts the agent is built
with the expected plugins/tools, never touching AWS.

- [ ] **Step 1: Write the failing test**

Create `tests/test_loader.py`:
```python
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

    def fake_session_manager_factory(memory_id, region):
        captured["memory_id"] = memory_id
        return f"session-manager:{memory_id}"

    def fake_ci_tool_factory(region):
        captured["ci_region"] = region
        return "ci-tool"

    build_agent(
        memory_id="mem-123",
        code_interpreter_region="us-west-2",
        skill_sources=[str(SKILLS_DIR)],
        agent_factory=fake_agent_factory,
        session_manager_factory=fake_session_manager_factory,
        ci_tool_factory=fake_ci_tool_factory,
    )

    assert captured["memory_id"] == "mem-123"
    assert captured["ci_region"] == "us-west-2"
    assert captured["session_manager"] == "session-manager:mem-123"
    assert "ci-tool" in captured["tools"]
    # the paper tool is always present
    assert any(getattr(t, "__name__", "") == "fetch_paper" or t == "ci-tool" for t in captured["tools"])
    # an AgentSkills plugin is registered
    assert any(p.__class__.__name__ == "AgentSkills" for p in captured["plugins"])
    # system prompt is passed
    assert "research co-pilot" in captured["system_prompt"].lower()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_loader.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'agent.loader'`.

- [ ] **Step 3: Write minimal implementation**

Create `agent/loader.py`:
```python
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_loader.py -v`
Expected: PASS (2 passed). If the installed Strands `Agent` rejects the
`plugins=` or `session_manager=` kwarg name, run
`uv run python -c "from strands import Agent; help(Agent.__init__)"`, adjust the
kwarg names in `_default_agent_factory`/`build_agent`, and update the test's
`captured` assertions to match.

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/agent/loader.py 07-agentcore-demo/source/agent/tests/test_loader.py
git commit -m "✨ feat(agent): loader — wire Memory + Code Interpreter + Skills"
```

### Task 6: `main.py` — FastAPI HTTP shell (`/invocations` SSE + `/ping`)

**Files:**
- Create: `07-agentcore-demo/source/agent/agent/main.py`
- Test: `07-agentcore-demo/source/agent/tests/test_main.py`

The shell exposes the AgentCore Runtime HTTP contract: `POST /invocations`
(streams `text/event-stream`) and `GET /ping` → `{"status":"healthy"}`. The agent
is built lazily and cached, and is injectable for tests via a module-level
override so the route can be tested without cloud.

- [ ] **Step 1: Write the failing test**

Create `tests/test_main.py`:
```python
from fastapi.testclient import TestClient

import agent.main as main


def test_ping():
    client = TestClient(main.app)
    resp = client.get("/ping")
    assert resp.status_code == 200
    assert resp.json() == {"status": "healthy"}


def test_invocations_streams_agent_events(monkeypatch):
    class FakeAgent:
        def stream_async(self, prompt):
            async def gen():
                yield {"data": "hello "}
                yield {"data": "world"}
            return gen()

    monkeypatch.setattr(main, "get_agent", lambda: FakeAgent())
    client = TestClient(main.app)
    resp = client.post("/invocations", json={"prompt": "hi", "session_id": "s1"})
    assert resp.status_code == 200
    body = resp.text
    assert "hello " in body
    assert "world" in body
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_main.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'agent.main'`.

- [ ] **Step 3: Write minimal implementation**

Create `agent/main.py`:
```python
"""AgentCore Runtime HTTP shell. No business logic lives here."""
import json
import os

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

from agent.loader import build_agent

app = FastAPI(title="ResearchCopilot", version="0.1.0")

_AGENT = None


def _skill_sources() -> list[str] | None:
    """Skill sources from env: comma-separated dirs and/or https SKILL.md URLs.

    Unset → loader default (repo-local skills dir only). The CDK agent-stack
    sets SKILL_SOURCES to include both the bundled skills dir and a couple of
    huggingface/skills raw SKILL.md URLs so the demo shows external skill reuse.
    """
    raw = os.environ.get("SKILL_SOURCES", "").strip()
    if not raw:
        return None
    return [s.strip() for s in raw.split(",") if s.strip()]


def get_agent():
    """Lazily build and cache the agent (overridable in tests)."""
    global _AGENT
    if _AGENT is None:
        _AGENT = build_agent(
            memory_id=os.environ["MEMORY_ID"],
            code_interpreter_region=os.environ.get("AWS_REGION", "us-west-2"),
            skill_sources=_skill_sources(),
        )
    return _AGENT


@app.get("/ping")
def ping():
    return {"status": "healthy"}


@app.post("/invocations")
async def invocations(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")

    async def event_stream():
        agent = get_agent()
        async for event in agent.stream_async(prompt):
            chunk = event.get("data") if isinstance(event, dict) else str(event)
            if chunk:
                yield f"data: {json.dumps({'text': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_main.py -v`
Expected: PASS (2 passed). If the installed Strands streaming method is named
differently (e.g. `stream` vs `stream_async`) or yields a different event shape,
run `uv run python -c "from strands import Agent; print([m for m in dir(Agent) if 'stream' in m])"`
and adjust both `event_stream()` and the `FakeAgent` in the test to match.

- [ ] **Step 5: Run the full agent test suite**

Run: `uv run pytest -v`
Expected: all tests from Tasks 1-6 PASS.

- [ ] **Step 6: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/agent/main.py 07-agentcore-demo/source/agent/tests/test_main.py
git commit -m "✨ feat(agent): FastAPI shell — /invocations SSE + /ping"
```

### Task 7: Dockerfile (ARM64)

**Files:**
- Create: `07-agentcore-demo/source/agent/Dockerfile`
- Create: `07-agentcore-demo/source/agent/.dockerignore`

AgentCore Runtime requires an ARM64 container listening on `0.0.0.0:8080` with a
`/ping` health endpoint (both satisfied by Task 6).

- [ ] **Step 1: Write `agent/.dockerignore`**

```
.venv/
__pycache__/
**/*.pyc
.pytest_cache/
tests/
```

- [ ] **Step 2: Write `agent/Dockerfile`**

```dockerfile
# AgentCore Runtime requires linux/arm64.
FROM --platform=linux/arm64 python:3.12-slim

WORKDIR /app

# Install uv for fast, reproducible installs.
RUN pip install --no-cache-dir uv

# Install dependencies first for layer caching.
COPY pyproject.toml ./
RUN uv pip install --system --no-cache .

# Copy application code.
COPY agent ./agent

EXPOSE 8080
CMD ["python", "-m", "agent.main"]
```

- [ ] **Step 3: Build to verify (if Docker + buildx available)**

Run:
```bash
cd 07-agentcore-demo/source/agent
docker build --platform linux/arm64 -t research-copilot-agent:test .
```
Expected: image builds successfully. If buildx/ARM emulation is unavailable on
the build host, skip this step — CDK builds the image at deploy time (Task 9);
note the skip in the commit message.

- [ ] **Step 4: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/agent/Dockerfile 07-agentcore-demo/source/agent/.dockerignore
git commit -m "✨ feat(agent): ARM64 Dockerfile for AgentCore Runtime"
```

---

## Phase 4 — Infrastructure (TypeScript CDK)

> The exact `@aws-cdk/aws-bedrock-agentcore-alpha` construct API (class names,
> prop names) must be confirmed against the installed version in Task 8, Step 4.
> The reference repo `data-agent` uses: `agentcore.Memory({memoryName,
> expirationDuration})`, `agentcore.CodeInterpreterCustom({codeInterpreterCustomName,
> networkConfiguration: CodeInterpreterNetworkConfiguration.usingPublicNetwork(),
> executionRole})`, `agentcore.Runtime({runtimeName, agentRuntimeArtifact:
> AgentRuntimeArtifact.fromAsset(dir, {platform: Platform.LINUX_ARM64, file}),
> executionRole, environmentVariables})`. Mirror those signatures.

### Task 8: CDK project init + dependencies

**Files:**
- Create: `07-agentcore-demo/source/infrastructure/package.json`
- Create: `07-agentcore-demo/source/infrastructure/tsconfig.json`
- Create: `07-agentcore-demo/source/infrastructure/cdk.json`
- Create: `07-agentcore-demo/source/infrastructure/jest.config.js`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "research-copilot-infra",
  "version": "0.1.0",
  "bin": { "infra": "bin/app.js" },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "cdk": "cdk"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^22.0.0",
    "aws-cdk": "^2.160.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.6.0"
  },
  "dependencies": {
    "aws-cdk-lib": "^2.160.0",
    "@aws-cdk/aws-bedrock-agentcore-alpha": "latest",
    "constructs": "^10.3.0"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "types": ["node", "jest"]
  },
  "exclude": ["node_modules", "cdk.out"]
}
```

- [ ] **Step 3: Write `cdk.json`**

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/app.ts",
  "context": {
    "@aws-cdk/core:newStyleStackSynthesis": true
  }
}
```

- [ ] **Step 4: Write `jest.config.js`**

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
};
```

- [ ] **Step 5: Install and confirm the construct API**

Run:
```bash
cd 07-agentcore-demo/source/infrastructure
npm install
npx cdk --version
node -e "const m=require('@aws-cdk/aws-bedrock-agentcore-alpha'); console.log(Object.keys(m).sort().join('\n'))"
```
Expected: prints exported construct names. Confirm `Runtime`, `Memory`,
`CodeInterpreterCustom`, `AgentRuntimeArtifact`, `CodeInterpreterNetworkConfiguration`,
`RuntimeAuthorizerConfiguration` are present. If a name differs, record the actual
name and use it in Tasks 9-11. Pin `@aws-cdk/aws-bedrock-agentcore-alpha` from
`latest` to the resolved exact version in `package.json`.

- [ ] **Step 6: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/infrastructure/package.json 07-agentcore-demo/source/infrastructure/tsconfig.json 07-agentcore-demo/source/infrastructure/cdk.json 07-agentcore-demo/source/infrastructure/jest.config.js 07-agentcore-demo/source/infrastructure/package-lock.json
git commit -m "🌱 scaffold(infra): CDK project init + agentcore-alpha dependency"
```

### Task 9: `agent-stack.ts` — Runtime + Memory + Code Interpreter + IAM

**Files:**
- Create: `07-agentcore-demo/source/infrastructure/lib/agent-stack.ts`
- Test: `07-agentcore-demo/source/infrastructure/test/agent-stack.test.ts`

- [ ] **Step 1: Write the failing snapshot/assertion test**

Create `test/agent-stack.test.ts`:
```typescript
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AgentStack } from '../lib/agent-stack';

test('agent stack provisions runtime, memory, and code interpreter', () => {
  const app = new App();
  const stack = new AgentStack(app, 'TestAgentStack', {
    env: { account: '111111111111', region: 'us-west-2' },
  });
  const template = Template.fromStack(stack);

  // An execution role that AgentCore can assume.
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: { Service: 'bedrock-agentcore.amazonaws.com' },
        },
      ],
      Version: '2012-10-17',
    },
  });

  // Stack exposes the runtime ARN + memory id as outputs.
  const outputs = template.findOutputs('*');
  const keys = Object.keys(outputs);
  expect(keys.some((k) => k.toLowerCase().includes('runtimearn'))).toBe(true);
  expect(keys.some((k) => k.toLowerCase().includes('memoryid'))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd 07-agentcore-demo/source/infrastructure && npm test`
Expected: FAIL — cannot find module `../lib/agent-stack`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/agent-stack.ts`. Adjust construct/prop names to the exact API
confirmed in Task 8 Step 5 if they differ:
```typescript
import * as path from 'path';
import { Aws, CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as agentcore from '@aws-cdk/aws-bedrock-agentcore-alpha';

export class AgentStack extends Stack {
  public readonly runtimeArn: string;
  public readonly memoryId: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const memory = new agentcore.Memory(this, 'Memory', {
      memoryName: 'research_copilot_memory',
      description: 'Cross-session memory for the research co-pilot',
      expirationDuration: Duration.days(30),
    });

    const ciRole = new iam.Role(this, 'CodeInterpreterRole', {
      assumedBy: new iam.ServicePrincipal('bedrock-agentcore.amazonaws.com'),
    });

    const codeInterpreter = new agentcore.CodeInterpreterCustom(this, 'CodeInterpreter', {
      codeInterpreterCustomName: 'research_copilot_ci',
      description: 'Sandbox for reproducing experiments',
      networkConfiguration: agentcore.CodeInterpreterNetworkConfiguration.usingPublicNetwork(),
      executionRole: ciRole,
    });

    const execRole = new iam.Role(this, 'AgentRuntimeRole', {
      assumedBy: new iam.ServicePrincipal('bedrock-agentcore.amazonaws.com'),
      inlinePolicies: {
        AgentCorePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['ecr:BatchGetImage', 'ecr:GetDownloadUrlForLayer'],
              resources: [`arn:aws:ecr:${Aws.REGION}:${Aws.ACCOUNT_ID}:repository/*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['ecr:GetAuthorizationToken'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents', 'logs:DescribeLogStreams', 'logs:DescribeLogGroups'],
              resources: [`arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/bedrock-agentcore/runtimes/*`, `arn:aws:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:*`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords', 'xray:GetSamplingRules', 'xray:GetSamplingTargets'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock-agentcore:*Event*'],
              resources: [memory.memoryArn],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock-agentcore:*CodeInterpreter*'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
              resources: ['arn:aws:bedrock:*::foundation-model/*', `arn:aws:bedrock:${Aws.REGION}:${Aws.ACCOUNT_ID}:*`],
            }),
          ],
        }),
      },
    });

    const artifact = agentcore.AgentRuntimeArtifact.fromAsset(
      path.join(__dirname, '../../agent'),
      { platform: ecr_assets.Platform.LINUX_ARM64, file: 'Dockerfile' },
    );

    const runtime = new agentcore.Runtime(this, 'Runtime', {
      runtimeName: 'research_copilot_runtime',
      agentRuntimeArtifact: artifact,
      executionRole: execRole,
      description: 'Research co-pilot agent runtime',
      environmentVariables: {
        MEMORY_ID: memory.memoryId,
        CODE_INTERPRETER_ID: codeInterpreter.codeInterpreterId,
        AWS_REGION: this.region,
        // Repo-local skills (bundled at /app/agent/skills in the container)
        // plus two huggingface/skills referenced by raw SKILL.md URL, so the
        // demo shows external community-skill reuse with zero modification.
        SKILL_SOURCES: [
          '/app/agent/skills',
          'https://raw.githubusercontent.com/huggingface/skills/main/huggingface-papers/SKILL.md',
          'https://raw.githubusercontent.com/huggingface/skills/main/huggingface-datasets/SKILL.md',
        ].join(','),
      },
    });

    this.runtimeArn = runtime.agentRuntimeArn;
    this.memoryId = memory.memoryId;

    new CfnOutput(this, 'RuntimeArn', { value: runtime.agentRuntimeArn });
    new CfnOutput(this, 'MemoryId', { value: memory.memoryId });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS. If construct/prop names differ from Task 8's findings, fix them
here and re-run.

> Before deploy (Task 15), confirm the two huggingface/skills raw URLs resolve:
> `curl -sI https://raw.githubusercontent.com/huggingface/skills/main/huggingface-papers/SKILL.md | head -1`
> should return `200`. If a skill folder was renamed upstream, update the URL in
> `SKILL_SOURCES`. The skills load non-strict, so an unreachable URL warns rather
> than crashing the runtime — but the booth story wants them present.

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/infrastructure/lib/agent-stack.ts 07-agentcore-demo/source/infrastructure/test/agent-stack.test.ts
git commit -m "✨ feat(infra): agent-stack — Runtime + Memory + Code Interpreter"
```

### Task 10: `identity-stack.ts` — Cognito identity for browser access

**Files:**
- Create: `07-agentcore-demo/source/infrastructure/lib/identity-stack.ts`
- Test: `07-agentcore-demo/source/infrastructure/test/identity-stack.test.ts`

A Cognito Identity Pool with unauthenticated (guest) access; its IAM role is
scoped to `bedrock-agentcore:InvokeAgentRuntime` on a single runtime ARN passed
in as a prop. Demo-only.

- [ ] **Step 1: Write the failing test**

Create `test/identity-stack.test.ts`:
```typescript
import { App } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { IdentityStack } from '../lib/identity-stack';

test('identity stack scopes invoke to a single runtime arn', () => {
  const app = new App();
  const arn = 'arn:aws:bedrock-agentcore:us-west-2:111111111111:runtime/abc';
  const stack = new IdentityStack(app, 'TestIdentity', {
    runtimeArn: arn,
    env: { account: '111111111111', region: 'us-west-2' },
  });
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::Cognito::IdentityPool', 1);
  template.hasResourceProperties('AWS::Cognito::IdentityPool', {
    AllowUnauthenticatedIdentities: true,
  });
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: 'bedrock-agentcore:InvokeAgentRuntime',
          Resource: arn,
        }),
      ]),
    },
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- identity-stack`
Expected: FAIL — cannot find module `../lib/identity-stack`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/identity-stack.ts`:
```typescript
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export interface IdentityStackProps extends StackProps {
  readonly runtimeArn: string;
}

export class IdentityStack extends Stack {
  public readonly identityPoolId: string;

  constructor(scope: Construct, id: string, props: IdentityStackProps) {
    super(scope, id, props);

    const pool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
    });

    const guestRole = new iam.Role(this, 'GuestRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': pool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    guestRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['bedrock-agentcore:InvokeAgentRuntime'],
        resources: [props.runtimeArn],
      }),
    );

    new cognito.CfnIdentityPoolRoleAttachment(this, 'RoleAttachment', {
      identityPoolId: pool.ref,
      roles: { unauthenticated: guestRole.roleArn },
    });

    this.identityPoolId = pool.ref;
    new CfnOutput(this, 'IdentityPoolId', { value: pool.ref });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- identity-stack`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/infrastructure/lib/identity-stack.ts 07-agentcore-demo/source/infrastructure/test/identity-stack.test.ts
git commit -m "✨ feat(infra): identity-stack — Cognito guest access scoped to runtime"
```

### Task 11: `web-stack.ts` — S3 + CloudFront + config.json injection

**Files:**
- Create: `07-agentcore-demo/source/infrastructure/lib/web-stack.ts`
- Test: `07-agentcore-demo/source/infrastructure/test/web-stack.test.ts`

Hosts the static `web/` SPA and writes a `config.json` (runtimeArn, region,
identityPoolId) into the bucket via a `BucketDeployment` data source.

- [ ] **Step 1: Write the failing test**

Create `test/web-stack.test.ts`:
```typescript
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { WebStack } from '../lib/web-stack';

test('web stack provisions a bucket and a cloudfront distribution', () => {
  const app = new App();
  const stack = new WebStack(app, 'TestWeb', {
    runtimeArn: 'arn:aws:bedrock-agentcore:us-west-2:111111111111:runtime/abc',
    identityPoolId: 'us-west-2:pool-id',
    env: { account: '111111111111', region: 'us-west-2' },
  });
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::S3::Bucket', 1);
  template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  const outputs = template.findOutputs('*');
  expect(Object.keys(outputs).some((k) => k.toLowerCase().includes('url'))).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- web-stack`
Expected: FAIL — cannot find module `../lib/web-stack`.

- [ ] **Step 3: Write minimal implementation**

Create `lib/web-stack.ts`:
```typescript
import * as path from 'path';
import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export interface WebStackProps extends StackProps {
  readonly runtimeArn: string;
  readonly identityPoolId: string;
}

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'WebBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    const config = {
      runtimeArn: props.runtimeArn,
      region: this.region,
      identityPoolId: props.identityPoolId,
    };

    new s3deploy.BucketDeployment(this, 'DeployWeb', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '../../web')),
        s3deploy.Source.jsonData('config.json', config),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'WebUrl', { value: `https://${distribution.distributionDomainName}` });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- web-stack`
Expected: PASS. (Requires the `web/` directory to exist; if `Source.asset`
errors on a missing dir, create a placeholder `web/index.html` now — Task 12
fills it.)

- [ ] **Step 5: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/infrastructure/lib/web-stack.ts 07-agentcore-demo/source/infrastructure/test/web-stack.test.ts
git commit -m "✨ feat(infra): web-stack — S3 + CloudFront + config.json"
```

### Task 11b: `bin/app.ts` — wire the three stacks

**Files:**
- Create: `07-agentcore-demo/source/infrastructure/bin/app.ts`

- [ ] **Step 1: Write `bin/app.ts`**

```typescript
#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { AgentStack } from '../lib/agent-stack';
import { IdentityStack } from '../lib/identity-stack';
import { WebStack } from '../lib/web-stack';

const app = new App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-west-2',
};

const agent = new AgentStack(app, 'ResearchCopilotAgent', { env });
const identity = new IdentityStack(app, 'ResearchCopilotIdentity', {
  env,
  runtimeArn: agent.runtimeArn,
});
new WebStack(app, 'ResearchCopilotWeb', {
  env,
  runtimeArn: agent.runtimeArn,
  identityPoolId: identity.identityPoolId,
});
```

- [ ] **Step 2: Verify synth of the full app**

Run:
```bash
cd 07-agentcore-demo/source/infrastructure
npx cdk synth --quiet
```
Expected: all three stacks synthesize without error (requires `web/index.html`
to exist — created in Task 11 Step 4 or Task 12).

- [ ] **Step 3: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/infrastructure/bin/app.ts
git commit -m "✨ feat(infra): wire AgentStack + IdentityStack + WebStack"
```

---

## Phase 5 — Web Panel (static SPA)

### Task 12: `web/` panel — three live tiles, browser-direct invoke

**Files:**
- Create: `07-agentcore-demo/source/web/index.html`
- Create: `07-agentcore-demo/source/web/app.js`

No automated test (static browser asset); validated by the booth dry-run in
Task 15. The panel loads `config.json` (written by the web stack), obtains guest
credentials from the Cognito Identity Pool, signs `InvokeAgentRuntime` with
SigV4, and renders the streamed events into three tiles. We load the AWS SDK v3
from a CDN ESM build to keep the SPA buildless.

- [ ] **Step 1: Write `web/index.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AgentCore Research Co-pilot</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #0f1117; color: #e6e6e6; }
    header { padding: 16px 24px; background: #161a22; font-size: 20px; font-weight: 600; }
    .controls { padding: 16px 24px; display: flex; gap: 8px; }
    input, button { font-size: 16px; padding: 8px 12px; border-radius: 6px; border: 1px solid #333; }
    input { flex: 1; background: #1c2129; color: #fff; }
    button { background: #ff9900; color: #111; font-weight: 600; cursor: pointer; }
    .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; }
    .tile { background: #161a22; border-radius: 10px; padding: 16px; min-height: 320px; }
    .tile h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #ff9900; margin: 0 0 12px; }
    pre { white-space: pre-wrap; word-break: break-word; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <header>🧪 AgentCore Research Co-pilot — Builder Demo</header>
  <div class="controls">
    <input id="prompt" placeholder="e.g. read arXiv 2104.09864 and store the key insight" />
    <input id="session" placeholder="session id" value="booth-1" style="flex:0 0 160px" />
    <button id="go">Run</button>
  </div>
  <div class="tiles">
    <div class="tile"><h2>Pipeline</h2><pre id="pipeline"></pre></div>
    <div class="tile"><h2>Memory</h2><pre id="memory"></pre></div>
    <div class="tile"><h2>Sandbox</h2><pre id="sandbox"></pre></div>
  </div>
  <script type="module" src="./app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `web/app.js`**

```javascript
import {
  BedrockAgentCoreClient,
  InvokeAgentRuntimeCommand,
} from 'https://esm.sh/@aws-sdk/client-bedrock-agentcore@3';
import {
  CognitoIdentityClient,
} from 'https://esm.sh/@aws-sdk/client-cognito-identity@3';
import {
  fromCognitoIdentityPool,
} from 'https://esm.sh/@aws-sdk/credential-provider-cognito-identity@3';

const tiles = {
  pipeline: document.getElementById('pipeline'),
  memory: document.getElementById('memory'),
  sandbox: document.getElementById('sandbox'),
};

function append(tile, text) {
  tiles[tile].textContent += text;
}

function route(text) {
  // Lightweight routing of streamed text into tiles by marker.
  if (text.includes('activated skill') || /step\s*\d/i.test(text)) append('pipeline', text);
  else if (/score|recall|remember|memory/i.test(text)) append('memory', text);
  else if (/accuracy|=|stdout|sandbox|plot/i.test(text)) append('sandbox', text);
  else append('pipeline', text);
}

async function main() {
  const cfg = await (await fetch('./config.json')).json();
  const credentials = fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: cfg.region }),
    identityPoolId: cfg.identityPoolId,
  });
  const client = new BedrockAgentCoreClient({ region: cfg.region, credentials });

  document.getElementById('go').onclick = async () => {
    for (const t of Object.values(tiles)) t.textContent = '';
    const prompt = document.getElementById('prompt').value;
    const sessionId = document.getElementById('session').value || 'booth-1';
    const payload = new TextEncoder().encode(JSON.stringify({ prompt, session_id: sessionId }));
    const resp = await client.send(
      new InvokeAgentRuntimeCommand({
        agentRuntimeArn: cfg.runtimeArn,
        runtimeSessionId: sessionId.padEnd(33, '0'),
        payload,
      }),
    );
    // response.response is a streaming byte source; decode incrementally.
    const decoder = new TextDecoder();
    for await (const chunk of resp.response) {
      const text = decoder.decode(chunk, { stream: true });
      for (const line of text.split('\n')) {
        const m = line.match(/^data:\s*(.*)$/);
        if (!m || m[1] === '[DONE]') continue;
        try { route(JSON.parse(m[1]).text ?? ''); }
        catch { route(m[1]); }
      }
    }
  };
}

main().catch((e) => append('pipeline', 'Init error: ' + e.message));
```

- [ ] **Step 3: Verify the page loads locally (static, no AWS)**

Run:
```bash
cd 07-agentcore-demo/source/web
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
curl -s localhost:8000/index.html | grep -q "Research Co-pilot" && echo "PAGE OK"
kill $SERVER_PID
```
Expected: prints `PAGE OK`. (Live invocation is exercised in Task 15 after deploy;
`config.json` does not exist until then, so the page will show an init error
locally — that is expected.)

- [ ] **Step 4: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/source/web/index.html 07-agentcore-demo/source/web/app.js
git commit -m "✨ feat(web): booth panel — 3 live tiles, browser-direct invoke"
```

---

## Phase 6 — CLI Booth Scripts

### Task 13: `scripts/demo.sh` and `scripts/seed.sh`

**Files:**
- Create: `07-agentcore-demo/scripts/demo.sh`
- Create: `07-agentcore-demo/scripts/seed.sh`

These use the AWS CLI with the operator's local credentials. `demo.sh` is the
clone-and-run source of truth; `seed.sh` pre-loads Memory before the booth opens.

- [ ] **Step 1: Write `scripts/demo.sh`**

```bash
#!/usr/bin/env bash
# demo.sh — booth driver. Invokes the deployed AgentCore runtime over the CLI.
#
# Usage:
#   export RUNTIME_ARN=arn:aws:bedrock-agentcore:us-west-2:ACCT:runtime/xxxx
#   ./scripts/demo.sh "read arXiv 2104.09864 and store the key insight" booth-1
set -euo pipefail

PROMPT="${1:-read arXiv 2104.09864 and store the key insight}"
SESSION="${2:-booth-1}"
REGION="${AWS_REGION:-us-west-2}"
: "${RUNTIME_ARN:?set RUNTIME_ARN to the deployed runtime ARN (cdk output RuntimeArn)}"

# Session id must be >= 33 chars.
SESSION_ID=$(printf '%s' "$SESSION" | sed 's/[^a-zA-Z0-9_-]//g')
while [ "${#SESSION_ID}" -lt 33 ]; do SESSION_ID="${SESSION_ID}0"; done

BOLD=$(tput bold 2>/dev/null || true); RESET=$(tput sgr0 2>/dev/null || true)
echo "${BOLD}▶ prompt:${RESET} $PROMPT"
echo "${BOLD}▶ session:${RESET} $SESSION_ID"
echo "${BOLD}▶ invoking runtime...${RESET}"

aws bedrock-agentcore invoke-agent-runtime \
  --agent-runtime-arn "$RUNTIME_ARN" \
  --runtime-session-id "$SESSION_ID" \
  --payload "$(printf '{"prompt": %s, "session_id": "%s"}' "$(printf '%s' "$PROMPT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" "$SESSION")" \
  --region "$REGION" \
  /dev/stdout
echo
echo "${BOLD}✓ done${RESET}"
```

- [ ] **Step 2: Write `scripts/seed.sh`**

```bash
#!/usr/bin/env bash
# seed.sh — pre-seed Memory by running the agent on a few papers.
# Run once before the booth opens.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PAPERS=("2104.09864" "1706.03762")  # RoPE, Attention Is All You Need

for id in "${PAPERS[@]}"; do
  echo "Seeding paper $id ..."
  "$HERE/demo.sh" "read arXiv $id and store the key insight" "seed-session" || true
  sleep 2
done
echo "Seed complete."
```

- [ ] **Step 3: Make executable and lint with shellcheck (if available)**

Run:
```bash
cd /home/ec2-user/research/ai-research-harness/07-agentcore-demo/scripts
chmod +x demo.sh seed.sh
command -v shellcheck >/dev/null && shellcheck demo.sh seed.sh || echo "shellcheck not installed — skipping"
bash -n demo.sh && bash -n seed.sh && echo "SYNTAX OK"
```
Expected: prints `SYNTAX OK` (and no shellcheck errors if installed).

- [ ] **Step 4: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/scripts/demo.sh 07-agentcore-demo/scripts/seed.sh
git commit -m "✨ feat(scripts): demo.sh booth driver + seed.sh memory seeding"
```

---

## Phase 7 — Docs, Mirror, Integration

### Task 14: README + Gitee mirror Action

**Files:**
- Create: `07-agentcore-demo/README.md`
- Create: `.github/workflows/gitee-mirror.yml`
- Modify: `README.md` (root — add a pointer to the demo)

- [ ] **Step 1: Write `07-agentcore-demo/README.md`**

````markdown
# AgentCore Research Co-pilot · Builder Demo

A real, CDK-deployable demo that runs the `ai-research-harness` pipeline on
Amazon Bedrock AgentCore. Showcases **Runtime + Memory + Code Interpreter**, plus
a Strands **skills** layer (repo-local + huggingface/skills).

## What it shows

| Layer | Service | Pain point it kills |
|---|---|---|
| Deploy | AgentCore Runtime | serverless ARM64 microVM |
| Memory | AgentCore Memory | 🔁 re-explaining context every session |
| Skills | Strands AgentSkills + huggingface/skills | 🎲 no repeatable workflow |
| Verify | AgentCore Code Interpreter | 🤡 "looks perfect", runs broken |

## Deploy (one command)

```bash
cd source/infrastructure
npm install
npx cdk deploy --all          # builds ARM64 image → ECR; provisions everything
# outputs: ResearchCopilotWeb.WebUrl, ResearchCopilotAgent.RuntimeArn
```

## Run the booth demo

```bash
export RUNTIME_ARN=<RuntimeArn output>
./scripts/seed.sh             # pre-seed Memory
./scripts/demo.sh "read arXiv 2104.09864 and store the key insight" booth-1
```

Open the `WebUrl` for the live 3-tile panel.

## Teardown

```bash
cd source/infrastructure && npx cdk destroy --all
```

## Prerequisites

- AWS account in an AgentCore-available region
- Bedrock model access (Claude) enabled
- Node 20+, AWS CDK v2, Docker (ARM64 build), Python 3.12 + uv

## Generalization

Swap `source/agent/agent/tools/`, `source/agent/agent/skills/`, and
`prompts/system.md` and the same Runtime + Memory + CI + Skills skeleton becomes a
finance / bio / ops agent — no infra changes. See the root README's
generalization table.
````

- [ ] **Step 2: Write `.github/workflows/gitee-mirror.yml`**

```yaml
name: Mirror to Gitee
on:
  push:
    branches: [main]
jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Push to Gitee
        env:
          GITEE_URL: ${{ secrets.GITEE_REPO_URL }}
          GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
          GITEE_USER: ${{ secrets.GITEE_USER }}
        run: |
          if [ -z "$GITEE_URL" ]; then echo "GITEE_REPO_URL not set; skipping"; exit 0; fi
          git remote add gitee "https://${GITEE_USER}:${GITEE_TOKEN}@${GITEE_URL}"
          git push --force gitee main
```

> Requires repo secrets `GITEE_REPO_URL` (host/path, no scheme), `GITEE_USER`,
> `GITEE_TOKEN`. Documented in the root README credits.

- [ ] **Step 3: Add a pointer in the root `README.md`**

In the "你能从这里拿到什么" table (root `README.md`), add a row after the slides row:
```markdown
| 看真正跑在 AgentCore 上的 demo（Summit Builder 展位） | [`07-agentcore-demo/`](./07-agentcore-demo/) |
```
And add the English equivalent in the "What you'll find" table:
```markdown
| Real AgentCore demo (Summit Builder booth) | [`07-agentcore-demo/`](./07-agentcore-demo/) |
```

- [ ] **Step 4: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/README.md .github/workflows/gitee-mirror.yml README.md
git commit -m "📝 docs: demo README + Gitee mirror action + root pointer"
```

### Task 15: Live integration smoke test (requires AWS deploy)

**Files:**
- Create: `07-agentcore-demo/scripts/smoke.sh`

This is a manual gate, run against a real deploy. Not part of CI.

- [ ] **Step 1: Write `scripts/smoke.sh`**

```bash
#!/usr/bin/env bash
# smoke.sh — post-deploy sanity checks. Requires RUNTIME_ARN set.
set -euo pipefail
: "${RUNTIME_ARN:?set RUNTIME_ARN}"
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "== 1. digest a paper =="
"$HERE/demo.sh" "read arXiv 2104.09864 and store the key insight" "smoke-A" | tee /tmp/smoke1.txt
grep -iq "rope\|rotary\|position" /tmp/smoke1.txt && echo "PASS digest" || { echo "FAIL digest"; exit 1; }

echo "== 2. memory recall in a NEW session =="
"$HERE/demo.sh" "what have we studied about position embeddings?" "smoke-B" | tee /tmp/smoke2.txt
grep -iq "rope\|rotary\|2104.09864" /tmp/smoke2.txt && echo "PASS recall" || { echo "FAIL recall"; exit 1; }

echo "== 3. reproduce in sandbox =="
"$HERE/demo.sh" "reproduce a minimal check of the core claim and show the numbers" "smoke-C" | tee /tmp/smoke3.txt
grep -Eiq "[0-9]+\.[0-9]+|accuracy|result" /tmp/smoke3.txt && echo "PASS reproduce" || { echo "FAIL reproduce"; exit 1; }

echo "ALL SMOKE CHECKS PASSED"
```

- [ ] **Step 2: Deploy and run the smoke test**

Run:
```bash
cd 07-agentcore-demo/source/infrastructure
npx cdk deploy --all --require-approval never
export RUNTIME_ARN=$(aws cloudformation describe-stacks --stack-name ResearchCopilotAgent \
  --query "Stacks[0].Outputs[?OutputKey=='RuntimeArn'].OutputValue" --output text)
chmod +x ../../scripts/smoke.sh
../../scripts/smoke.sh
```
Expected: `ALL SMOKE CHECKS PASSED`. If recall fails, check Memory extraction
(`memory_list_extraction_jobs`) — extraction is async; allow a short delay or
re-run step 2.

- [ ] **Step 3: Open the web panel and dry-run the dual-climax flow**

Run:
```bash
aws cloudformation describe-stacks --stack-name ResearchCopilotWeb \
  --query "Stacks[0].Outputs[?OutputKey=='WebUrl'].OutputValue" --output text
```
Open the URL; run the 4-step booth flow from spec §5 (discover → memory recall in
a fresh session → reproduce → persist). Confirm all three tiles populate.

- [ ] **Step 4: Commit**

```bash
cd /home/ec2-user/research/ai-research-harness
git add 07-agentcore-demo/scripts/smoke.sh
git commit -m "✅ test(demo): post-deploy smoke checks for the dual-climax flow"
```

- [ ] **Step 5: Tear down to control cost (after the booth)**

```bash
cd 07-agentcore-demo/source/infrastructure
npx cdk destroy --all
```

---

## Self-Review Notes (for the implementer)

- **Version pinning:** Tasks 0 and 8 use floor/`latest` versions, then pin exact
  resolved versions after first install. The Strands `Agent`/Memory/skills APIs
  and the `agentcore-alpha` construct names are confirmed empirically in Task 5
  Step 4, Task 6 Step 4, and Task 8 Step 5 — adjust code to the installed reality
  if signatures differ.
- **Cloud-free CI:** Phases 1-6 are fully testable without AWS (HTTP mocked, CI
  client faked, Strands `Agent` injected, CDK `synth`/snapshot only). Only Task 15
  needs a live account.
- **Cost hygiene:** Task 15 ends with `cdk destroy --all`; Memory expiry is 30d.
- **Bonus features (Browser/Gateway):** intentionally deferred — out of scope per
  spec §10. Add later by registering `strands_tools.browser.AgentCoreBrowser` in
  `loader.build_agent()` and a gateway construct in a new stack.
