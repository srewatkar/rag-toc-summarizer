from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(
    title="RAG T&C Summarizer API",
    description="""
Upload legal documents and get AI-powered summaries with red flags highlighted.
Ask questions about any document in plain English.

## Authentication
All endpoints except `/health` require a Supabase JWT:
```
Authorization: Bearer <access_token>
```

## Interactive docs
Use the **Authorize** button above to enter your token, then try any endpoint directly.
""",
    version="1.0.0",
    contact={
        "name": "RAG T&C Summarizer",
    },
    license_info={
        "name": "MIT",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health"], summary="Health check")
async def health():
    """Returns `ok` if the server is running."""
    return {"status": "ok"}

from app.routers import upload
app.include_router(upload.router, tags=["Documents"])

from app.routers import documents
app.include_router(documents.router, tags=["Documents"])

from app.routers import chat
app.include_router(chat.router, tags=["Chat"])

from app.routers import account
app.include_router(account.router, tags=["Account"])
