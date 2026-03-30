from __future__ import annotations

from typing import Optional

from supabase import create_client, Client
from app.config import settings

_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _client


def reset_client() -> None:
    global _client
    _client = None
