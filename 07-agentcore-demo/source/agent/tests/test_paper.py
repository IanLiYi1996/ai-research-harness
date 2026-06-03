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
