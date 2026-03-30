from unittest.mock import patch, MagicMock, AsyncMock
from app.pipeline.runner import run_pipeline

async def test_run_pipeline_success():
    mock_client = MagicMock()
    mock_summary = {"overview": "x", "key_points": [], "red_flags": [], "watch_out": []}

    with patch("app.pipeline.runner.get_client", return_value=mock_client), \
         patch("app.pipeline.runner.load_text", return_value="extracted text"), \
         patch("app.pipeline.runner.chunk_text", return_value=["chunk 1"]), \
         patch("app.pipeline.runner.embed_and_store", new_callable=AsyncMock), \
         patch("app.pipeline.runner.summarize_document", new_callable=AsyncMock, return_value=mock_summary):

        await run_pipeline(document_id="doc-1", source_type="text", content="some text")

    # should update status to 'ready'
    update_calls = mock_client.table.return_value.update.call_args_list
    final_call = update_calls[-1][0][0]
    assert final_call["status"] == "ready"

async def test_run_pipeline_marks_error_on_failure():
    mock_client = MagicMock()

    with patch("app.pipeline.runner.get_client", return_value=mock_client), \
         patch("app.pipeline.runner.load_text", side_effect=ValueError("empty")):

        await run_pipeline(document_id="doc-1", source_type="text", content="")

    update_calls = mock_client.table.return_value.update.call_args_list
    final_call = update_calls[-1][0][0]
    assert final_call["status"] == "error"
