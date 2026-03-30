from unittest.mock import patch, MagicMock

async def test_list_documents(client):
    mock_user = {"id": "user-1"}
    mock_docs = [{"id": "doc-1", "title": "Terms", "status": "ready", "created_at": "2026-01-01"}]
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = mock_docs
    with patch("app.routers.documents.get_current_user", return_value=mock_user), \
         patch("app.routers.documents.get_client", return_value=mock_db):
        response = await client.get("/documents", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200
    assert len(response.json()) == 1

async def test_get_document_returns_summary_and_messages(client):
    mock_user = {"id": "user-1"}
    mock_doc = [{"id": "doc-1", "user_id": "user-1", "title": "T&C", "status": "ready"}]
    mock_summary = [{"overview": "Test", "key_points": [], "red_flags": [], "watch_out": []}]
    mock_messages = [{"role": "user", "content": "Q?", "created_at": "2026-01-01"}]
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_doc
    mock_db.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value.data = mock_summary[0]
    mock_db.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = mock_messages
    with patch("app.routers.documents.get_current_user", return_value=mock_user), \
         patch("app.routers.documents.get_client", return_value=mock_db):
        response = await client.get("/documents/doc-1", headers={"Authorization": "Bearer token"})
    assert response.status_code == 200

async def test_get_document_returns_404_for_wrong_user(client):
    mock_user = {"id": "user-2"}
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    with patch("app.routers.documents.get_current_user", return_value=mock_user), \
         patch("app.routers.documents.get_client", return_value=mock_db):
        response = await client.get("/documents/doc-1", headers={"Authorization": "Bearer token"})
    assert response.status_code == 404

async def test_delete_document_wrong_user_returns_404(client):
    mock_user = {"id": "user-2"}
    mock_doc = [{"id": "doc-1", "user_id": "user-1"}]
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_doc
    with patch("app.routers.documents.get_current_user", return_value=mock_user), \
         patch("app.routers.documents.get_client", return_value=mock_db):
        response = await client.delete("/documents/doc-1", headers={"Authorization": "Bearer token"})
    assert response.status_code == 404

async def test_delete_document(client):
    mock_user = {"id": "user-1"}
    mock_doc = [{"id": "doc-1", "user_id": "user-1"}]
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = mock_doc
    mock_db.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock()
    with patch("app.routers.documents.get_current_user", return_value=mock_user), \
         patch("app.routers.documents.get_client", return_value=mock_db):
        response = await client.delete("/documents/doc-1", headers={"Authorization": "Bearer token"})
    assert response.status_code == 204
