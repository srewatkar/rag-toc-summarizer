from io import BytesIO
from unittest.mock import patch, MagicMock, AsyncMock

async def test_upload_text_returns_document_id(client):
    mock_user = {"id": "user-1", "email": "test@test.com"}
    mock_doc = {"id": "doc-1"}
    mock_db = MagicMock()
    mock_db.table.return_value.insert.return_value.execute.return_value.data = [mock_doc]
    with patch("app.routers.upload.get_current_user", return_value=mock_user), \
         patch("app.routers.upload.get_client", return_value=mock_db), \
         patch("app.routers.upload.check_upload_limit", new_callable=AsyncMock), \
         patch("app.routers.upload.run_pipeline", new_callable=AsyncMock):
        response = await client.post(
            "/upload",
            data={"source_type": "text", "content": "test terms"},
            headers={"Authorization": "Bearer test-token"},
        )
    assert response.status_code == 202
    assert response.json()["document_id"] == "doc-1"

async def test_upload_rejects_oversized_file(client):
    mock_user = {"id": "user-1", "email": "test@test.com"}
    large_bytes = b"x" * (11 * 1024 * 1024)
    with patch("app.routers.upload.get_current_user", return_value=mock_user), \
         patch("app.routers.upload.check_upload_limit", new_callable=AsyncMock), \
         patch("app.routers.upload.get_client"):
        response = await client.post(
            "/upload",
            files={"file": ("test.pdf", BytesIO(large_bytes), "application/pdf")},
            headers={"Authorization": "Bearer test-token"},
        )
    assert response.status_code == 413

async def test_upload_requires_auth(client):
    response = await client.post("/upload", data={"source_type": "text", "content": "test"})
    assert response.status_code == 401
