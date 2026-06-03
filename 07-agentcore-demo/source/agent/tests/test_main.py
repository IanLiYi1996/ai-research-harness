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
