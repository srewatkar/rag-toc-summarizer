import asyncio
import logging
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.db import get_client

logger = logging.getLogger(__name__)

DAILY_LIMIT = 10

async def check_upload_limit(user_id: str) -> None:
    today = datetime.now(timezone.utc).date()
    today_start = today.isoformat()
    tomorrow_start = (today + timedelta(days=1)).isoformat()

    client = get_client()

    def _query():
        return (
            client.table("documents")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("created_at", today_start)
            .lt("created_at", tomorrow_start)
            .execute()
        )

    try:
        result = await asyncio.to_thread(_query)
    except Exception as exc:
        logger.error("Supabase query failed in check_upload_limit: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Upload limit check unavailable. Please try again later.",
        ) from exc

    count = result.count
    if count is None:
        logger.warning(
            "result.count is None for user %s; skipping rate-limit check", user_id
        )
        return

    if count >= DAILY_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="You've reached the daily upload limit of 10 documents. Try again tomorrow.",
        )
