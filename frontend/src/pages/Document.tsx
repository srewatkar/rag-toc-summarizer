import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDocument, updateDocumentTitle } from '../lib/api'
import SummaryCard from '../components/SummaryCard'
import ChatInterface from '../components/ChatInterface'

export default function Document() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [titleError, setTitleError] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !id) return
      const tok = `Bearer ${session.access_token}`
      setToken(tok)
      const result = await getDocument(id, tok)
      setData(result)
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus()
  }, [editingTitle])

  function startEdit() {
    setTitleDraft(data.document.title)
    setTitleError('')
    setEditingTitle(true)
  }

  function cancelEdit() {
    setEditingTitle(false)
    setTitleError('')
  }

  async function saveTitle() {
    const trimmed = titleDraft.trim()
    if (!trimmed) { setTitleError('Title cannot be empty'); return }
    if (trimmed === data.document.title) { setEditingTitle(false); return }
    const previous = data.document.title
    // Optimistic update — close edit mode immediately so the user sees the new title right away
    setData((prev: any) => ({ ...prev, document: { ...prev.document, title: trimmed } }))
    setEditingTitle(false)
    try {
      await updateDocumentTitle(id!, trimmed, token)
    } catch {
      // Revert on failure and re-open edit mode
      setData((prev: any) => ({ ...prev, document: { ...prev.document, title: previous } }))
      setTitleDraft(trimmed)
      setEditingTitle(true)
      setTitleError('Failed to save — please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-indigo-600" aria-hidden="true" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="alert">
        <span className="text-red-600">Document not found</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main id="main-content" className="max-w-6xl mx-auto py-8 px-4 sm:py-12">
        <Link to="/dashboard" className="text-indigo-600 text-sm hover:underline mb-6 block">
          ← Back to documents
        </Link>
        {editingTitle ? (
          <div className="mb-2">
            <label htmlFor="doc-title-input" className="sr-only">Document title</label>
            <input
              id="doc-title-input"
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') cancelEdit() }}
              className="text-2xl font-bold text-gray-900 border-b-2 border-indigo-500 bg-transparent focus:outline-none w-full"
              aria-describedby={titleError ? 'title-error' : undefined}
            />
            {titleError && <p id="title-error" role="alert" className="text-red-600 text-sm mt-1">{titleError}</p>}
            <div className="flex gap-3 mt-2">
              <button
                onClick={saveTitle}
                className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{data.document.title}</h1>
            <button
              onClick={startEdit}
              aria-label="Edit document title"
              className="text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 13H9v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
              </svg>
            </button>
          </div>
        )}
        <p className="text-gray-500 text-sm mb-8">
          {new Date(data.document.created_at).toLocaleDateString()}
        </p>

        {data.document.status === 'processing' && (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600">Still analyzing…</p>
          </div>
        )}

        {data.document.status === 'error' && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            Something went wrong processing this document. Please try uploading again.
          </div>
        )}

        {data.document.status === 'ready' && data.summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left — summary */}
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
              <SummaryCard summary={data.summary} />
            </div>
            {/* Right — chat, sticky so it stays in view while scrolling the summary */}
            <div className="lg:sticky lg:top-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Ask Questions</h2>
              <ChatInterface documentId={id!} token={token} initialMessages={data.messages || []} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
