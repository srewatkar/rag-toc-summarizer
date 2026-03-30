import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from fastapi import HTTPException
from app.rate_limit import check_upload_limit


def _make_mock_client(count: int) -> MagicMock:
    """Build a mock Supabase client whose chained query returns a result with .count."""
    mock_result = MagicMock()
    mock_result.count = count

    mock_client = MagicMock()
    (
        mock_client.table.return_value
        .select.return_value
        .eq.return_value
        .gte.return_value
        .lt.return_value
        .execute.return_value
    ) = mock_result
    return mock_client


@pytest.mark.asyncio
async def test_allows_upload_under_limit():
    mock_client = _make_mock_client(count=5)  # 5 uploads today, under limit
    with patch("app.rate_limit.get_client", return_value=mock_client):
        # should not raise
        await check_upload_limit("user-123")


@pytest.mark.asyncio
async def test_blocks_upload_at_limit():
    mock_client = _make_mock_client(count=10)  # 10 uploads today, at limit
    with patch("app.rate_limit.get_client", return_value=mock_client):
        with pytest.raises(HTTPException) as exc:
            await check_upload_limit("user-123")
        assert exc.value.status_code == 429
        assert "daily upload limit" in exc.value.detail


@pytest.mark.asyncio
async def test_blocks_upload_over_limit():
    mock_client = _make_mock_client(count=15)  # over limit
    with patch("app.rate_limit.get_client", return_value=mock_client):
        with pytest.raises(HTTPException) as exc:
            await check_upload_limit("user-123")
        assert exc.value.status_code == 429


@pytest.mark.asyncio
async def test_check_upload_limit_db_error():
    """When the Supabase query raises, the function should raise HTTP 503."""
    mock_client = MagicMock()
    with patch("app.rate_limit.get_client", return_value=mock_client):
        with patch(
            "app.rate_limit.asyncio.to_thread",
            side_effect=Exception("connection refused"),
        ):
            with pytest.raises(HTTPException) as exc:
                await check_upload_limit("user-123")
            assert exc.value.status_code == 503


@pytest.mark.asyncio
async def test_allows_upload_when_count_is_none():
    """If result.count is None (count='exact' not honoured), skip the limit check."""
    mock_client = _make_mock_client(count=None)
    with patch("app.rate_limit.get_client", return_value=mock_client):
        # should not raise — graceful degradation
        await check_upload_limit("user-123")
