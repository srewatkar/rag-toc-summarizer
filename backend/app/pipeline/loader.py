from __future__ import annotations
import io
from typing import Optional
import fitz  # PyMuPDF
import requests
from docx import Document
from bs4 import BeautifulSoup


def load_text(
    source_type: str,
    content: Optional[str] = None,
    url: Optional[str] = None,
    file_bytes: Optional[bytes] = None,
) -> str:
    if source_type == "text":
        text = (content or "").strip()
    elif source_type == "url":
        if url is None:
            raise ValueError("url must be provided for source_type='url'")
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Failed to fetch URL: {e}") from e
        soup = BeautifulSoup(response.content, "html.parser")
        text = soup.get_text(separator="\n", strip=True)
    elif source_type == "pdf":
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = "\n".join(page.get_text() for page in doc)
        except Exception as e:
            raise ValueError("Document appears to be empty or unreadable") from e
    elif source_type == "docx":
        try:
            doc = Document(io.BytesIO(file_bytes))
            text = "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            raise ValueError("Document appears to be empty or unreadable") from e
    else:
        raise ValueError(f"Unknown source_type: {source_type}")

    text = text.strip()
    if not text:
        raise ValueError("Document appears to be empty or unreadable")
    return text
