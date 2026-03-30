import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from app.auth import verify_jwt, get_current_user


@pytest.mark.asyncio
async def test_verify_jwt_valid_token():
    mock_client = MagicMock()
    mock_client.auth.get_user.return_value = MagicMock(
        user=MagicMock(id="user-123", email="a@b.com")
    )
    with patch("app.auth.get_client", return_value=mock_client):
        user = await verify_jwt("valid-token")
        assert user["id"] == "user-123"
        assert user["email"] == "a@b.com"


@pytest.mark.asyncio
async def test_verify_jwt_invalid_token():
    mock_client = MagicMock()
    mock_client.auth.get_user.return_value = MagicMock(user=None)
    with patch("app.auth.get_client", return_value=mock_client):
        with pytest.raises(HTTPException) as exc:
            await verify_jwt("bad-token")
        assert exc.value.status_code == 401
        assert exc.value.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.asyncio
async def test_verify_jwt_exception_becomes_401():
    mock_client = MagicMock()
    mock_client.auth.get_user.side_effect = Exception("network error")
    with patch("app.auth.get_client", return_value=mock_client):
        with pytest.raises(HTTPException) as exc:
            await verify_jwt("bad-token")
        assert exc.value.status_code == 401
        assert exc.value.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.asyncio
async def test_get_current_user_no_credentials():
    with pytest.raises(HTTPException) as exc:
        await get_current_user(credentials=None)
    assert exc.value.status_code == 401
    assert exc.value.detail == "Missing token"
    assert exc.value.headers["WWW-Authenticate"] == "Bearer"


@pytest.mark.asyncio
async def test_get_current_user_valid_credentials():
    mock_credentials = MagicMock()
    mock_credentials.credentials = "valid-token"

    mock_client = MagicMock()
    mock_client.auth.get_user.return_value = MagicMock(
        user=MagicMock(id="user-123", email="a@b.com")
    )
    with patch("app.auth.get_client", return_value=mock_client):
        user = await get_current_user(credentials=mock_credentials)
        assert user["id"] == "user-123"
        assert user["email"] == "a@b.com"
