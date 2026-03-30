import os
import pytest
from httpx import AsyncClient, ASGITransport

# Set required env vars BEFORE any app module is imported (prevents Settings ValidationError)
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "test-service-key")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-test")
os.environ.setdefault("OPENAI_API_KEY", "sk-test")

from app.main import app
import app.db as db_module

@pytest.fixture(autouse=True)
def reset_db_client():
    """Reset the Supabase client singleton between tests to prevent mock bleed."""
    db_module.reset_client()
    yield
    db_module.reset_client()

@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
