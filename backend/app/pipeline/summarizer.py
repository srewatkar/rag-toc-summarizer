from __future__ import annotations
import asyncio
import json
import logging
from typing import Any
import anthropic
from app.config import settings

logger = logging.getLogger(__name__)

SUMMARIZE_PROMPT = """You are a legal document analyst. Analyze the following document excerpts and return a JSON object with exactly these keys:
- "overview": a 2-3 sentence plain-English summary of what this document is
- "key_points": list of strings — the main things the user is agreeing to (max 6)
- "red_flags": list of strings — risky or unusual clauses (max 4)
- "watch_out": list of strings — things to be aware of (max 4)

Return ONLY valid JSON, no markdown, no explanation.

Document excerpts:
{text}"""

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client

async def summarize_document(chunks: list[str]) -> dict[str, Any]:
    if not chunks:
        raise ValueError("Cannot summarize: no chunks provided")

    top_chunks = chunks[:10]
    text = "\n\n---\n\n".join(top_chunks)
    client = _get_client()
    response = None
    try:
        response = await asyncio.to_thread(
            client.messages.create,
            model="claude-opus-4-6",
            max_tokens=2048,
            messages=[{"role": "user", "content": SUMMARIZE_PROMPT.format(text=text)}],
        )
        result = json.loads(response.content[0].text)
        required_keys = {"overview", "key_points", "red_flags", "watch_out"}
        missing = required_keys - set(result.keys())
        if missing:
            raise RuntimeError(f"Summarization response missing keys: {missing}")
        return result
    except json.JSONDecodeError as e:
        raw = response.content[0].text if response and response.content else "<no response>"
        logger.error("Failed to parse Claude response as JSON. Raw: %s", raw)
        raise RuntimeError(f"Summarization returned invalid JSON: {e}") from e
    except Exception as e:
        logger.error("Summarization failed: %s", e)
        raise RuntimeError(f"Summarization failed: {e}") from e
