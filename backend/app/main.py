from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(title="RAG T&C Summarizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

from app.routers import upload
app.include_router(upload.router)

from app.routers import documents
app.include_router(documents.router)

from app.routers import chat
app.include_router(chat.router)
