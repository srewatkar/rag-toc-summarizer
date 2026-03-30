from app.pipeline.chunker import chunk_text


def test_chunk_text_splits_long_text():
    long_text = "word " * 500  # 2500 chars
    chunks = chunk_text(long_text)
    assert len(chunks) > 1
    assert all(len(c) <= 1200 for c in chunks)  # 1000 + 200 overlap tolerance


def test_chunk_text_short_text_returns_single_chunk():
    short_text = "Short terms and conditions."
    chunks = chunk_text(short_text)
    assert len(chunks) == 1
    assert chunks[0] == short_text


def test_chunk_text_returns_list_of_strings():
    chunks = chunk_text("Some text content here.")
    assert isinstance(chunks, list)
    assert all(isinstance(c, str) for c in chunks)


def test_chunk_text_raises_on_empty_text():
    import pytest
    with pytest.raises(ValueError, match="Text is empty"):
        chunk_text("")
