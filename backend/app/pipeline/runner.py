from __future__ import annotations
import asyncio
import logging
from typing import Optional
from app.db import get_client
from app.pipeline.loader import load_text
from app.pipeline.chunker import chunk_text
from app.pipeline.embedder import embed_and_store
from app.pipeline.summarizer import summarize_document

logger = logging.getLogger(__name__)

PIPELINE_TIMEOUT = 60  # seconds


async def _run(
    client,
    document_id: str,
    source_type: str,
    content: Optional[str] = None,
    url: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
) -> None:
    # 1. Load
    text = await asyncio.to_thread(
        load_text,
        source_type=source_type,
        content=content,
        url=url,
        file_bytes=file_bytes,
    )

    # 2. Save extracted text
    # Pass .execute (without calling it) as the callable; to_thread will invoke it in a thread pool
    await asyncio.to_thread(
        client.table("documents").update({"extracted_text": text}).eq("id", document_id).execute
    )

    # 3. Chunk
    chunks = await asyncio.to_thread(chunk_text, text)

    # 4. Embed + store
    await embed_and_store(document_id=document_id, chunks=chunks)

    # 5. Summarize
    summary = await summarize_document(chunks=chunks)
    await asyncio.to_thread(
        client.table("summaries").insert({
            "document_id": document_id,
            "overview": summary["overview"],
            "key_points": summary["key_points"],
            "red_flags": summary["red_flags"],
            "watch_out": summary["watch_out"],
        }).execute
    )

    # 6. Mark ready
    await asyncio.to_thread(
        client.table("documents").update({"status": "ready"}).eq("id", document_id).execute
    )
    logger.info("Pipeline completed for document %s", document_id)


async def run_pipeline(
    document_id: str,
    source_type: str,
    content: Optional[str] = None,
    url: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
) -> None:
    client = get_client()
    try:
        await asyncio.wait_for(
            _run(client, document_id, source_type, content, url, file_bytes),
            timeout=PIPELINE_TIMEOUT,
        )
    except asyncio.TimeoutError:
        logger.error("Pipeline timed out after %s seconds for document %s", PIPELINE_TIMEOUT, document_id)
        try:
            await asyncio.to_thread(
                client.table("documents").update({"status": "error"}).eq("id", document_id).execute
            )
        except Exception:
            logger.error("Failed to mark document %s as error after timeout", document_id)
    except Exception as e:
        logger.error("Pipeline failed for document %s: %s", document_id, e)
        try:
            await asyncio.to_thread(
                client.table("documents").update({"status": "error"}).eq("id", document_id).execute
            )
        except Exception:
            logger.error("Failed to mark document %s as error", document_id)
