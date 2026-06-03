"""Fetch arXiv paper metadata. Pure function, no AgentCore dependency."""
import re
import xml.etree.ElementTree as ET

import httpx

_ATOM = "{http://www.w3.org/2005/Atom}"
_ARXIV_API = "http://export.arxiv.org/api/query"


def slugify(text: str) -> str:
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
