import pytest
from unittest.mock import patch, MagicMock
from app.pipeline.loader import load_text


def test_load_text_from_plain_text():
    text = load_text(source_type="text", content="Hello world")
    assert text == "Hello world"


def test_load_text_from_url():
    mock_response = MagicMock()
    mock_response.content = b"<html><body><p>Terms content</p></body></html>"
    with patch("app.pipeline.loader.requests.get", return_value=mock_response):
        text = load_text(source_type="url", url="https://example.com/terms")
    assert "Terms content" in text


def test_load_text_from_pdf():
    # create a minimal PDF-like bytes object
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Test PDF content")
    pdf_bytes = doc.tobytes()
    text = load_text(source_type="pdf", file_bytes=pdf_bytes)
    assert "Test PDF content" in text


def test_load_text_from_docx(tmp_path):
    from docx import Document
    d = Document()
    d.add_paragraph("Test DOCX content")
    path = tmp_path / "test.docx"
    d.save(str(path))
    text = load_text(source_type="docx", file_bytes=path.read_bytes())
    assert "Test DOCX content" in text


def test_load_text_raises_on_empty():
    with pytest.raises(ValueError, match="empty or unreadable"):
        load_text(source_type="text", content="   ")


def test_load_text_raises_on_unknown_source_type():
    with pytest.raises(ValueError, match="Unknown source_type"):
        load_text(source_type="unknown")


def test_load_text_from_url_http_error():
    import requests as req
    mock_response = MagicMock()
    mock_response.raise_for_status.side_effect = req.exceptions.HTTPError("404 Not Found")
    with patch("app.pipeline.loader.requests.get", return_value=mock_response):
        with pytest.raises(ValueError, match="Failed to fetch URL"):
            load_text(source_type="url", url="https://example.com/terms")
