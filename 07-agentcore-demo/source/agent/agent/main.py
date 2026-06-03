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
