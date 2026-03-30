import json
import pytest
from unittest.mock import patch, MagicMock
from app.pipeline.summarizer import summarize_document


async def test_summarize_returns_structured_output():
    mock_summary = {
        "overview": "This is a test agreement.",
        "key_points": ["Point 1", "Point 2"],
        "red_flags": ["Flag 1"],
        "watch_out": ["Watch 1"],
    }
    mock_client = MagicMock()
    mock_client.messages.create.return_value = MagicMock(
        content=[MagicMock(text=json.dumps(mock_summary))]
    )
    with patch("app.pipeline.summarizer._get_client", return_value=mock_client):
        result = await summarize_document(chunks=["chunk 1", "chunk 2"])
    assert result["overview"] == "This is a test agreement."
    assert len(result["key_points"]) == 2
    assert "red_flags" in result


async def test_summarize_uses_first_10_chunks():
    chunks = [f"chunk {i}" for i in range(20)]
    mock_summary = {"overview": "x", "key_points": [], "red_flags": [], "watch_out": []}
    mock_client = MagicMock()
    mock_client.messages.create.return_value = MagicMock(
        content=[MagicMock(text=json.dumps(mock_summary))]
    )
    with patch("app.pipeline.summarizer._get_client", return_value=mock_client):
        await summarize_document(chunks=chunks)
    call_kwargs = mock_client.messages.create.call_args[1]
    prompt_text = call_kwargs["messages"][0]["content"]
    # Only first 10 chunks should appear
    assert "chunk 9" in prompt_text
    assert "chunk 10" not in prompt_text


async def test_summarize_raises_on_empty_chunks():
    with pytest.raises(ValueError, match="Cannot summarize: no chunks provided"):
        await summarize_document(chunks=[])


async def test_summarize_raises_runtime_error_on_api_exception():
    mock_client = MagicMock()
    mock_client.messages.create.side_effect = Exception("API connection error")
    with patch("app.pipeline.summarizer._get_client", return_value=mock_client):
        with pytest.raises(RuntimeError, match="Summarization failed"):
            await summarize_document(chunks=["chunk 1"])
