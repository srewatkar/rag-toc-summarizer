import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getDocument } from '../lib/api'
import SummaryCard from '../components/SummaryCard'
import ChatInterface from '../components/ChatInterface'

export default function Document() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<any>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
        <span className="text-gray-600">Loading…</span>
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
      <main id="main-content" className="max-w-3xl mx-auto py-8 px-4 sm:py-12">
        <Link to="/dashboard" className="text-indigo-600 text-sm hover:underline mb-6 block">
          ← Back to documents
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.document.title}</h1>
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
          <>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Summary</h2>
            <SummaryCard summary={data.summary} />
            <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-4">Ask Questions</h2>
            <ChatInterface documentId={id!} token={token} initialMessages={data.messages || []} />
          </>
        )}
      </main>
    </div>
  )
}
