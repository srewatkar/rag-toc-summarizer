from __future__ import annotations
import asyncio
import logging
import sys
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from app.auth import get_current_user  # noqa: F401 — kept so tests can patch this name
from app.db import get_client

logger = logging.getLogger(__name__)
router = APIRouter()

_security = HTTPBearer(auto_error=False)


class DocumentSummary(BaseModel):
    id: str
    title: str
    status: str
    source_type: str
    created_at: str


class SummaryDetail(BaseModel):
    overview: str
    key_points: List[str]
    red_flags: List[str]
    watch_out: List[str]


class ChatMessage(BaseModel):
    role: str
    content: str
    created_at: str


class DocumentDetail(BaseModel):
    document: dict
    summary: Optional[Any]
    messages: List[dict]


class TitleUpdate(BaseModel):
    title: str


async def _current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    """Indirection so tests can patch app.routers.documents.get_current_user."""
    fn = sys.modules[__name__].__dict__["get_current_user"]
    return await fn(credentials=credentials)


@router.get(
    "/documents",
    response_model=List[DocumentSummary],
    summary="List documents",
    responses={
        200: {"description": "List of documents, newest first"},
    },
)
async def list_documents(current_user: dict = Depends(_current_user_dep)):
    """
    Returns all documents belonging to the authenticated user, ordered newest first.

    `status` is one of: `processing` | `ready` | `error`
    """
    client = get_client()
    result = await asyncio.to_thread(
        client.table("documents")
        .select("id, title, status, source_type, created_at")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
        .execute
    )
    return result.data


@router.get(
    "/documents/{document_id}",
    response_model=DocumentDetail,
    summary="Get document with summary and chat history",
    responses={
        200: {"description": "Document data, AI summary, and chat messages"},
        404: {"description": "Document not found or does not belong to this user"},
    },
)
async def get_document(document_id: str, current_user: dict = Depends(_current_user_dep)):
    """
    Returns a document with its AI-generated summary and full chat history.

    - `summary` is `null` while the document is still `processing` or if it errored.
    - `messages` is the full question/answer history for this document.

    Poll this endpoint every 2 seconds after upload until `document.status` = `ready`.
    """
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

    summary_result = await asyncio.to_thread(
        client.table("summaries")
        .select("*")
        .eq("document_id", document_id)
        .execute
    )
    summary = summary_result.data[0] if summary_result.data else None

    messages = (await asyncio.to_thread(
        client.table("chat_messages")
        .select("role, content, created_at")
        .eq("document_id", document_id)
        .order("created_at")
        .execute
    )).data

    return {"document": document, "summary": summary, "messages": messages}


@router.patch(
    "/documents/{document_id}",
    summary="Update document title",
    responses={
        200: {"description": "Updated document"},
        400: {"description": "Title cannot be empty"},
        404: {"description": "Document not found or does not belong to this user"},
    },
)
async def update_document(document_id: str, body: TitleUpdate, current_user: dict = Depends(_current_user_dep)):
    """Update the title of a document."""
    title = body.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    client = get_client()
    doc_result = await asyncio.to_thread(
        client.table("documents")
        .select("id, user_id")
        .eq("id", document_id)
        .execute
    )
    if not doc_result.data or doc_result.data[0].get("user_id") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Document not found")
    result = await asyncio.to_thread(
        client.table("documents")
        .update({"title": title})
        .eq("id", document_id)
        .execute
    )
    return result.data[0]


@router.delete(
    "/documents/{document_id}",
    status_code=204,
    summary="Delete a document",
    responses={
        204: {"description": "Document deleted — chunks, summary, and chat history are also removed"},
        404: {"description": "Document not found or does not belong to this user"},
    },
)
async def delete_document(document_id: str, current_user: dict = Depends(_current_user_dep)):
    """
    Permanently deletes a document and all associated data (chunks, summary, chat messages)
    via cascading foreign key deletes.
    """
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
