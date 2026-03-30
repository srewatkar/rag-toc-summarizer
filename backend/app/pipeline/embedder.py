from __future__ import annotations
import asyncio
import logging
from langchain_openai import OpenAIEmbeddings
from app.db import get_client
from app.config import settings

logger = logging.getLogger(__name__)

_embeddings_model = None


def _get_embeddings_model() -> OpenAIEmbeddings:
    global _embeddings_model
    if _embeddings_model is None:
        _embeddings_model = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=settings.openai_api_key,
        )
    return _embeddings_model


async def embed_and_store(document_id: str, chunks: list[str]) -> None:
    if not chunks:
        return
    embeddings_model = _get_embeddings_model()
    # embed_documents is blocking I/O — run in thread to avoid blocking the event loop
    vectors = await asyncio.to_thread(embeddings_model.embed_documents, chunks)
    if len(vectors) != len(chunks):
        raise RuntimeError(f"Expected {len(chunks)} vectors, got {len(vectors)}")
    rows = [
        {
            "document_id": document_id,
            "content": chunk,
            "embedding": vector,
            "chunk_index": i,
        }
        for i, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    client = get_client()
    try:
        await asyncio.to_thread(client.table("document_chunks").insert(rows).execute)
    except Exception as exc:
        logger.error("Failed to store embeddings: %s", exc)
        raise RuntimeError(f"Failed to store embeddings: {exc}") from exc
