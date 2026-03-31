-- Enable pgvector extension
create extension if not exists vector;

-- source_type enum
create type source_type as enum ('pdf', 'url', 'text');

-- document_status enum
create type document_status as enum ('processing', 'ready', 'error');

-- message_role enum
create type message_role as enum ('user', 'assistant');

-- documents table
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_type source_type not null,
  source_url text,
  file_path text,
  extracted_text text,
  status document_status not null default 'processing',
  created_at timestamptz not null default now()
);

-- document_chunks table
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  embedding vector(1536),
  chunk_index integer not null,
  created_at timestamptz not null default now()
);

-- summaries table
create table summaries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  overview text not null,
  key_points jsonb not null default '[]',
  red_flags jsonb not null default '[]',
  watch_out jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- chat_messages table
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role message_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

-- index for vector similarity search
create index on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- index for daily upload count query
create index on documents (user_id, created_at);

-- RLS
alter table documents enable row level security;
alter table document_chunks enable row level security;
alter table summaries enable row level security;
alter table chat_messages enable row level security;

-- documents RLS policies
create policy "users see own documents" on documents
  for select using (auth.uid() = user_id);
create policy "users insert own documents" on documents
  for insert with check (auth.uid() = user_id);
create policy "users delete own documents" on documents
  for delete using (auth.uid() = user_id);

-- document_chunks RLS (read via document ownership)
create policy "users see own chunks" on document_chunks
  for select using (
    exists (select 1 from documents d where d.id = document_id and d.user_id = auth.uid())
  );

-- summaries RLS
create policy "users see own summaries" on summaries
  for select using (
    exists (select 1 from documents d where d.id = document_id and d.user_id = auth.uid())
  );

-- chat_messages RLS
create policy "users see own messages" on chat_messages
  for select using (auth.uid() = user_id);
create policy "users insert own messages" on chat_messages
  for insert with check (auth.uid() = user_id);

-- vector similarity search function used by the chat endpoint
create or replace function match_document_chunks(
  query_embedding vector(1536),
  doc_id uuid,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from document_chunks
  where document_id = doc_id
  order by embedding <=> query_embedding
  limit match_count;
$$;
