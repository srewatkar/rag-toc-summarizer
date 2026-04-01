from __future__ import annotations
from typing import Optional
import asyncio
import logging
import sys
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from app.auth import get_current_user  # noqa: F401 — kept so tests can patch this name
from app.db import get_client
from app.rate_limit import check_upload_limit
from app.pipeline.runner import run_pipeline

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

_security = HTTPBearer(auto_error=False)


class UploadResponse(BaseModel):
    document_id: str


async def _current_user_dep(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_security),
) -> dict:
    """Indirection so tests can patch app.routers.upload.get_current_user."""
    fn = sys.modules[__name__].__dict__["get_current_user"]
    return await fn(credentials=credentials)


@router.post(
    "/upload",
    status_code=202,
    response_model=UploadResponse,
    summary="Upload a document",
    responses={
        202: {"description": "Document accepted — processing starts in the background"},
        400: {"description": "Missing or invalid input"},
        413: {"description": "File exceeds 10 MB limit"},
        429: {"description": "Daily upload limit reached (5 per day)"},
    },
)
async def upload_document(
    background_tasks: BackgroundTasks,
    source_type: Optional[str] = Form(None, description="One of: `text`, `url`, `pdf`, `docx`"),
    url: Optional[str] = Form(None, description="Public URL to fetch (required when source_type=url)"),
    content: Optional[str] = Form(None, description="Plain text content (required when source_type=text)"),
    title: Optional[str] = Form(None, description="Optional custom document title"),
    file: Optional[UploadFile] = File(None, description="PDF or DOCX file, max 10 MB"),
    current_user: dict = Depends(_current_user_dep),
):
    """
    Upload a document for AI processing. Returns immediately with a `document_id`.

    Processing (chunking, embedding, summarization) runs in the background.
    Poll `GET /documents/{document_id}` every 2 seconds until `status` becomes `ready` or `error`.

    **Accepted sources:**
    - `source_type=text` + `content` — paste raw text
    - `source_type=url` + `url` — any publicly accessible URL
    - File upload — PDF or DOCX, max 10 MB
    """
    await check_upload_limit(current_user["id"])

    file_bytes: Optional[bytes] = None

    doc_title: str
    if file and file.filename:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds 10MB limit")
        source_type = "docx" if "wordprocessing" in (file.content_type or "") else "pdf"
        doc_title = title.strip() if title and title.strip() else (file.filename or "Uploaded document")
    elif source_type == "url" and url:
        doc_title = title.strip() if title and title.strip() else url
    elif source_type == "text" and content:
        doc_title = title.strip() if title and title.strip() else "Pasted document"
    else:
        raise HTTPException(status_code=400, detail="Must provide file, url, or text content")

    client = get_client()
    result = await asyncio.to_thread(
        client.table("documents").insert({
            "user_id": current_user["id"],
            "title": doc_title,
            "source_type": source_type,
            "source_url": url,
            "status": "processing",
        }).execute
    )
    document_id = result.data[0]["id"]

    background_tasks.add_task(
        run_pipeline,
        document_id=document_id,
        source_type=source_type,
        content=content,
        url=url,
        file_bytes=file_bytes,
    )
    return {"document_id": document_id}
