from __future__ import annotations
import asyncio
import logging
import sys
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.auth import get_current_user  # noqa: F401
from app.db import get_client

logger = logging.getLogger(__name__)
router = APIRouter()

_security = HTTPBearer(auto_error=False)


async def _current_user_dep(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    fn = sys.modules[__name__].__dict__["get_current_user"]
    return await fn(credentials=credentials)


@router.delete(
    "/account",
    status_code=204,
    summary="Delete account",
    tags=["Account"],
    responses={
        204: {"description": "Account and all associated data permanently deleted"},
    },
)
async def delete_account(current_user: dict = Depends(_current_user_dep)):
    """
    Permanently deletes the authenticated user's account.

    Deletes all the user's documents first (which cascades to chunks, summaries,
    and chat messages via foreign key constraints), then removes the auth user.
    """
    client = get_client()
    user_id = current_user["id"]

    # Delete documents — cascades to document_chunks, summaries, chat_messages
    await asyncio.to_thread(
        client.table("documents").delete().eq("user_id", user_id).execute
    )

    # Delete the auth user using the service-role admin API
    await asyncio.to_thread(client.auth.admin.delete_user, user_id)
