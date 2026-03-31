import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getDocument } from '../lib/api'
import UploadForm from '../components/UploadForm'

export default function Upload() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [polling, setPolling] = useState(false)
  const [docId, setDocId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setToken(`Bearer ${data.session.access_token}`)
    })
  }, [])

  useEffect(() => {
    if (!polling || !docId) return
    const interval = setInterval(async () => {
      const data = await getDocument(docId, token)
      if (data.document.status === 'ready') {
        clearInterval(interval)
        navigate(`/documents/${docId}`)
      } else if (data.document.status === 'error') {
        clearInterval(interval)
        setPolling(false)
        setError('Something went wrong processing your document. Please try again.')
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [polling, docId, token, navigate])

  function handleUploaded(id: string) {
    setDocId(id)
    setPolling(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyze a Document</h1>
        <p className="text-gray-500 mb-8">Upload a terms of service, lease agreement, or any legal document.</p>
        {polling ? (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-600">Analyzing your document…</p>
          </div>
        ) : (
          <>
            {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
            {token && <UploadForm token={token} onUploaded={handleUploaded} />}
          </>
        )}
      </div>
    </div>
  )
}
