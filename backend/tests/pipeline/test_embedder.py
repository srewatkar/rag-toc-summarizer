import pytest
from unittest.mock import patch, MagicMock
from app.pipeline.embedder import embed_and_store


async def test_embed_and_store_inserts_chunks():
    chunks = ["chunk one", "chunk two"]
    mock_embeddings = [[0.1] * 1536, [0.2] * 1536]

    mock_openai = MagicMock()
    mock_openai.embed_documents.return_value = mock_embeddings

    mock_client = MagicMock()
    mock_client.table.return_value.insert.return_value.execute.return_value = MagicMock()

    with patch("app.pipeline.embedder._get_embeddings_model", return_value=mock_openai), \
         patch("app.pipeline.embedder.get_client", return_value=mock_client), \
         patch("asyncio.to_thread", side_effect=lambda fn, *args, **kwargs: fn(*args, **kwargs)):
        await embed_and_store(document_id="doc-123", chunks=chunks)

    insert_call = mock_client.table.return_value.insert.call_args[0][0]
    assert len(insert_call) == 2
    assert insert_call[0]["document_id"] == "doc-123"
    assert insert_call[0]["chunk_index"] == 0
    assert insert_call[1]["chunk_index"] == 1
    assert insert_call[0]["content"] == "chunk one"
    assert insert_call[0]["embedding"] == [0.1] * 1536
    assert insert_call[1]["content"] == "chunk two"
    assert insert_call[1]["embedding"] == [0.2] * 1536


async def test_embed_and_store_empty_chunks_does_nothing():
    with patch("app.pipeline.embedder.get_client") as mock_get, \
         patch("app.pipeline.embedder._get_embeddings_model") as mock_model:
        await embed_and_store(document_id="doc-123", chunks=[])
        mock_get.assert_not_called()
        mock_model.assert_not_called()
