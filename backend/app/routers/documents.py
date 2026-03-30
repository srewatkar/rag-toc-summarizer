from __future__ import annotations
import asyncio
import logging
import sys
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.auth import get_current_user  # noqa: F401 — kept so tests can patch this name
from app.db import get_client

logger = logging.getLogger(__name__)
router = APIRouter()

_security = HTTPBearer(auto_error=False)


async def _current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    """Indirection so tests can patch app.routers.documents.get_current_user."""
    fn = sys.modules[__name__].__dict__["get_current_user"]
    return await fn(credentials=credentials)


@router.get("/documents")
async def list_documents(current_user: dict = Depends(_current_user_dep)):
    client = get_client()
    result = await asyncio.to_thread(
        client.table("documents")
        .select("id, title, status, source_type, created_at")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute
    )
    return result.data


@router.get("/documents/{document_id}")
async def get_document(document_id: str, current_user: dict = Depends(_current_user_dep)):
    client = get_client()
    doc_result = await asyncio.to_thread(
        client.table("documents")
        .select("*")
        .eq("id", document_id)
        .execute
    )
    if not doc_result.data or doc_result.data[0].get("user_id") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Document not found")
    document = doc_result.data[0]

    summary = (await asyncio.to_thread(
        client.table("summaries")
        .select("*")
        .eq("document_id", document_id)
        .maybe_single()
        .execute
    )).data

    messages = (await asyncio.to_thread(
        client.table("chat_messages")
        .select("role, content, created_at")
        .eq("document_id", document_id)
        .order("created_at")
        .execute
    )).data

    return {"document": document, "summary": summary, "messages": messages}


@router.delete("/documents/{document_id}", status_code=204)
async def delete_document(document_id: str, current_user: dict = Depends(_current_user_dep)):
    client = get_client()
    doc_result = await asyncio.to_thread(
        client.table("documents")
        .select("id, user_id")
        .eq("id", document_id)
        .execute
    )
    if not doc_result.data or doc_result.data[0].get("user_id") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Document not found")
    await asyncio.to_thread(
        client.table("documents").delete().eq("id", document_id).execute
    )
