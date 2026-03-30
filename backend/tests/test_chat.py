from unittest.mock import patch, MagicMock

async def test_chat_returns_answer(client):
    mock_user = {"id": "user-1"}
    mock_doc = [{"id": "doc-1", "user_id": "user-1"}]
    mock_chunks = [{"content": "You may not cancel within 30 days."}]
    mock_embed = [[0.1] * 1536]
    mock_answer = MagicMock(content=[MagicMock(text="You cannot cancel within 30 days.")])
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = mock_doc
    mock_db.rpc.return_value.execute.return_value.data = mock_chunks
    mock_openai = MagicMock()
    mock_openai.embed_query.return_value = mock_embed[0]
    mock_anthropic = MagicMock()
    mock_anthropic.messages.create.return_value = mock_answer
    with patch("app.routers.chat.get_current_user", return_value=mock_user), \
         patch("app.routers.chat.get_client", return_value=mock_db), \
         patch("app.routers.chat.OpenAIEmbeddings", return_value=mock_openai), \
         patch("app.routers.chat.anthropic.Anthropic", return_value=mock_anthropic):
        response = await client.post(
            "/chat",
            json={"document_id": "doc-1", "question": "Can I cancel?"},
            headers={"Authorization": "Bearer token"},
        )
    assert response.status_code == 200
    assert "answer" in response.json()

async def test_chat_document_not_found_for_wrong_user(client):
    mock_user = {"id": "user-2"}
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
    with patch("app.routers.chat.get_current_user", return_value=mock_user), \
         patch("app.routers.chat.get_client", return_value=mock_db):
        response = await client.post(
            "/chat",
            json={"document_id": "doc-1", "question": "Can I cancel?"},
            headers={"Authorization": "Bearer token"},
        )
    assert response.status_code == 404

async def test_chat_requires_auth(client):
    response = await client.post("/chat", json={"document_id": "x", "question": "q"})
    assert response.status_code == 401
