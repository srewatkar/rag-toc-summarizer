from __future__ import annotations
import asyncio
import logging
import sys
import anthropic
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from langchain_openai import OpenAIEmbeddings
from app.auth import get_current_user  # noqa: F401 — kept so tests can patch this name
from app.db import get_client
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

_security = HTTPBearer(auto_error=False)


async def _current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    """Indirection so tests can patch app.routers.chat.get_current_user."""
    fn = sys.modules[__name__].__dict__["get_current_user"]
    return await fn(credentials=credentials)


class ChatRequest(BaseModel):
    document_id: str
    question: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "document_id": "8f667cfc-2248-4ba2-82b1-ebc302a45119",
                "question": "Can I cancel my subscription anytime?",
            }
        }
    }


class ChatResponse(BaseModel):
    answer: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "answer": "Yes, you can cancel at any time, but no refund is issued for the current billing period."
            }
        }
    }


CHAT_PROMPT = """Answer the user's question using ONLY the document excerpts below.
If the answer is not in the excerpts, say: "I couldn't find information about that in this document."
Be concise and direct.

Document excerpts:
{context}

Question: {question}"""


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Ask a question about a document",
    responses={
        200: {"description": "Claude's answer based on the document content"},
        404: {"description": "Document not found or does not belong to this user"},
    },
)
async def chat(request: ChatRequest, current_user: dict = Depends(_current_user_dep)):
    """
    Ask a question about a document in plain English.

    Uses RAG (Retrieval Augmented Generation):
    1. Embeds the question into a vector
    2. Finds the 5 most relevant chunks from the document
    3. Sends those chunks + question to Claude
    4. Returns Claude's answer

    Claude only uses information from the document — it will say so if the answer isn't there.
    Both the question and answer are saved to the document's chat history.
    """
    client = get_client()
    doc_result = await asyncio.to_thread(
        client.table("documents")
        .select("id")
        .eq("id", request.document_id)
        .eq("user_id", current_user["id"])
        .execute
    )
    if not doc_result.data:
        raise HTTPException(status_code=404, detail="Document not found")

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small", openai_api_key=settings.openai_api_key)
    question_vector = await asyncio.to_thread(embeddings.embed_query, request.question)

    chunks_result = await asyncio.to_thread(
        client.rpc(
            "match_document_chunks",
            {"query_embedding": question_vector, "doc_id": request.document_id, "match_count": 5},
        ).execute
    )
    chunks = chunks_result.data or []
    context = "\n\n---\n\n".join(c["content"] for c in chunks)

    ai_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = await asyncio.to_thread(
        ai_client.messages.create,
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": CHAT_PROMPT.format(context=context, question=request.question)}],
    )
    answer = response.content[0].text

    await asyncio.to_thread(
        client.table("chat_messages").insert([
            {"document_id": request.document_id, "user_id": current_user["id"], "role": "user", "content": request.question},
            {"document_id": request.document_id, "user_id": current_user["id"], "role": "assistant", "content": answer},
        ]).execute
    )

    return {"answer": answer}
