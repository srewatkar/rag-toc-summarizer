from unittest.mock import patch, MagicMock


def test_get_client_returns_supabase_client():
    with patch("app.db.create_client") as mock_create:
        mock_client = MagicMock()
        mock_create.return_value = mock_client
        from app.db import get_client
        client = get_client()
        assert client is mock_client
