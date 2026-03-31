# RAG Terms & Conditions Summarizer

A web app that lets you upload any legal document (terms of service, lease agreement, privacy policy, etc.), get an AI-generated summary with red flags highlighted, and ask questions about it in plain English.

Built with FastAPI, React, Supabase, and Claude.

---

## How it works

### Upload flow

```
User uploads document (text / URL / PDF / DOCX)
  │
  ▼
Backend creates document record (status: "processing")
Returns document_id immediately → frontend starts polling
  │
  ▼
Background pipeline:
  1. Load      — fetch URL or extract text from PDF/DOCX
  2. Chunk     — split into 1000-char chunks, 200-char overlap
  3. Embed     — each chunk → vector (OpenAI text-embedding-3-small)
  4. Store     — vectors saved to Supabase (pgvector)
  5. Summarize — all chunks sent to Claude → structured JSON summary
  6. Done      — document status set to "ready"
  │
  ▼
Frontend polls GET /documents/{id} every 2 seconds
→ navigates to document page when status = "ready"
```

### Question answering (RAG)

```
User types question: "Can I cancel anytime?"
  │
  ▼
1. Embed question → vector
2. Vector similarity search against stored chunks (top 5 matches)
3. Send matched chunks + question to Claude
4. Claude answers using only those excerpts
5. Answer + question saved to chat_messages table
```

### Why chunking?

A full T&C document can be 50,000+ words. Sending it all to Claude for every question is slow and expensive. Chunking + vector search means Claude only sees the 3–5 most relevant paragraphs per question.

### Why a separate embedding model?

Claude is a generative model — it reads text and produces text. Embeddings (converting text to vectors for similarity search) require a different type of model. Claude does not expose embeddings; OpenAI's `text-embedding-3-small` or Voyage AI's `voyage-3-lite` fill this role.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | FastAPI (Python 3.9), uvicorn |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (JWT) |
| Summarization | Anthropic Claude (claude-opus-4-6) |
| Embeddings | OpenAI text-embedding-3-small |
| PDF parsing | PyMuPDF |
| DOCX parsing | python-docx |
| URL extraction | BeautifulSoup |
| Text splitting | LangChain RecursiveCharacterTextSplitter |

---

## Project structure

```
rag-toc-summarizer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, router registration
│   │   ├── config.py            # Pydantic settings (reads from .env)
│   │   ├── auth.py              # JWT verification via Supabase
│   │   ├── db.py                # Supabase client singleton
│   │   ├── rate_limit.py        # 5 uploads/user/day limit
│   │   ├── pipeline/
│   │   │   ├── loader.py        # Load text from URL / PDF / DOCX / plain text
│   │   │   ├── chunker.py       # Split text into overlapping chunks
│   │   │   ├── embedder.py      # Embed chunks + store in Supabase
│   │   │   ├── summarizer.py    # Claude summarization → JSON
│   │   │   └── runner.py        # Orchestrates the full pipeline
│   │   └── routers/
│   │       ├── upload.py        # POST /upload
│   │       ├── documents.py     # GET /documents, GET /documents/{id}, DELETE
│   │       └── chat.py          # POST /chat
│   ├── tests/                   # pytest test suite (43 tests)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── render.yaml              # Render deployment config
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   └── api.ts           # Backend API helpers
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx    # Document list
│   │   │   ├── Upload.tsx       # Upload form + polling
│   │   │   └── Document.tsx     # Summary + chat
│   │   ├── components/
│   │   │   ├── DocumentHistory.tsx
│   │   │   ├── UploadForm.tsx   # File / URL / paste text tabs
│   │   │   ├── SummaryCard.tsx  # Overview, key points, red flags
│   │   │   └── ChatInterface.tsx
│   │   └── App.tsx              # Router + auth guard
│   ├── vercel.json              # Vercel deployment config
│   └── package.json
└── supabase/
    └── migrations/
        └── 001_initial.sql      # Tables, RLS policies, pgvector function
```

---

## Local setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- A Supabase account (free at supabase.com)
- An Anthropic API key
- An OpenAI API key

### 1. Get API keys

**Anthropic (Claude)**
1. Go to console.anthropic.com
2. Sign in → API Keys → Create Key
3. Starts with `sk-ant-`

**OpenAI (embeddings)**
1. Go to platform.openai.com
2. API Keys → Create new secret key
3. Starts with `sk-`
4. Add at least $5 in billing credits (Billing → Add payment method)

### 2. Set up Supabase

1. Go to supabase.com → New project
2. When asked about security settings, enable both:
   - **Enable Data API** — required for supabase-js
   - **Enable automatic RLS** — enables row security on new tables
3. Wait for the project to be ready
4. Go to **SQL Editor** → New query
5. Paste the entire contents of `supabase/migrations/001_initial.sql` and click **Run**
6. Go to **Project Settings** → **API** to find your keys:
   - `URL` — your project URL (e.g. `https://xxxx.supabase.co`)
   - `anon` key — safe for browsers, used in frontend
   - `service_role` key — full DB access, used in backend only (keep secret)

### 3. Clone and install

```bash
git clone <your-repo-url>
cd rag-toc-summarizer
```

**Backend:**
```bash
cd backend
python3.9 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Configure environment variables

**`backend/.env`** (create this file):
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

**`frontend/.env.local`** (create this file):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

Note: `SUPABASE_URL` and `VITE_SUPABASE_URL` are the same value. The backend uses the `service_role` key; the frontend uses the `anon` key — these are different.

### 5. Run

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### 6. Run backend tests

```bash
cd backend
source .venv/bin/activate
pytest
```

---

## API reference

### Authentication

All endpoints (except `/health`) require a Supabase JWT passed as:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### `GET /health`
Returns `{"status": "ok"}`. No auth required.

#### `POST /upload`
Upload a document for processing. Returns immediately with a document ID; processing happens in the background.

**Content-Type:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `source_type` | string | `"text"`, `"url"`, `"pdf"`, or `"docx"` |
| `content` | string | Required when `source_type=text` |
| `url` | string | Required when `source_type=url` |
| `file` | file | Required when `source_type=pdf` or `docx` (max 10MB) |

**Response `202`:**
```json
{ "document_id": "uuid" }
```

**Errors:**
- `400` — missing or invalid input
- `413` — file exceeds 10MB
- `429` — daily upload limit reached (5/day)

#### `GET /documents`
List all documents for the authenticated user, ordered newest first.

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "title": "Terms of Service",
    "status": "ready",
    "source_type": "url",
    "created_at": "2026-03-30T10:00:00Z"
  }
]
```

Status values: `processing` | `ready` | `error`

#### `GET /documents/{id}`
Get a document with its summary and chat history.

**Response `200`:**
```json
{
  "document": {
    "id": "uuid",
    "title": "Terms of Service",
    "status": "ready",
    "source_type": "url",
    "created_at": "2026-03-30T10:00:00Z"
  },
  "summary": {
    "overview": "This is a subscription service agreement...",
    "key_points": ["Monthly billing", "Data shared with partners"],
    "red_flags": ["Automatic renewal without notification"],
    "watch_out": ["30-day cancellation notice required"]
  },
  "messages": [
    { "role": "user", "content": "Can I cancel?", "created_at": "..." },
    { "role": "assistant", "content": "Yes, with 30 days notice.", "created_at": "..." }
  ]
}
```

`summary` is `null` when status is `processing` or `error`.

#### `DELETE /documents/{id}`
Delete a document and all its chunks, summary, and chat messages (cascades via foreign keys).

**Response `204`:** No content.

#### `POST /chat`
Ask a question about a document.

**Request:**
```json
{ "document_id": "uuid", "question": "Can I cancel anytime?" }
```

**Response `200`:**
```json
{ "answer": "Yes, you can cancel at any time, but no refund is issued for partial months." }
```

---

## Deployment

### Backend → Render

1. Push this repo to GitHub
2. Go to render.com → New → Web Service
3. Connect your GitHub repo, select the `backend/` directory
4. Render will detect the `Dockerfile` automatically
5. Add environment variables in Render dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `CORS_ORIGINS` — set to your Vercel frontend URL (e.g. `https://your-app.vercel.app`)
6. Deploy

### Frontend → Vercel

1. Go to vercel.com → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` — set to your Render backend URL (e.g. `https://your-backend.onrender.com`)
4. Deploy

The `frontend/vercel.json` handles client-side routing automatically.

---

## Database schema

```sql
documents        — one row per uploaded document
document_chunks  — chunks of text + their embedding vectors
summaries        — Claude's structured analysis of the document
chat_messages    — question/answer history per document
```

All tables have Row Level Security (RLS) enabled — users can only access their own data.

---

## Rate limits

- 5 document uploads per user per day
- File uploads: 10MB max, PDF and DOCX only
- URL uploads: any publicly accessible URL
