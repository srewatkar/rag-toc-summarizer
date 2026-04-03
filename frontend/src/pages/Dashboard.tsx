import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { listDocuments, deleteDocument } from '../lib/api'
import DocumentHistory from '../components/DocumentHistory'

function getGreeting(name?: string): string {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = name?.trim().split(' ')[0]
  return firstName ? `${time}, ${firstName}!` : `${time}!`
}

export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState('')
  const cancelRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      const data = await listDocuments(`Bearer ${session.access_token}`)
      setDocs(data)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (confirmId) cancelRef.current?.focus()
  }, [confirmId])

  function requestDelete(id: string) {
    setConfirmId(id)
  }

  async function confirmDelete() {
    if (!confirmId) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setDeleting(true)
    try {
      await deleteDocument(confirmId, `Bearer ${session.access_token}`)
      setDocs(prev => prev.filter(d => d.id !== confirmId))
      setToast('Document deleted.')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const name = user?.user_metadata?.full_name

  return (
    <div className="min-h-screen bg-gray-50">
      <main id="main-content" className="max-w-3xl mx-auto py-8 px-4 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 mb-1 block">
              Clause<span className="text-gray-900">AI</span>
            </Link>
            <p className="text-sm text-gray-500 mb-1" aria-live="polite">{getGreeting(name)}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Documents</h1>
          </div>
          <nav aria-label="Dashboard actions" className="flex items-center gap-2 mt-1">
            <div className="relative group">
              <Link
                to="/profile"
                aria-label="Profile"
                className="text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 p-2.5 rounded-lg hover:bg-indigo-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Profile
              </span>
            </div>
            <div className="relative group">
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                className="text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 p-2.5 rounded-lg hover:bg-red-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Sign out
              </span>
            </div>
          </nav>
        </div>

        {/* Analyze button on its own row */}
        <div className="mb-8">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 min-h-[44px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Analyze Document
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12" role="status" aria-label="Loading">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-indigo-600" aria-hidden="true" />
          </div>
        ) : (
          <DocumentHistory docs={docs} onDelete={requestDelete} />
        )}
      </main>

      {/* Delete confirmation dialog */}
      {confirmId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onKeyDown={e => { if (e.key === 'Escape') setConfirmId(null) }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 id="delete-dialog-title" className="text-lg font-semibold text-gray-900 mb-2">Delete document?</h2>
            <p className="text-sm text-gray-600 mb-6">
              This will permanently delete the document along with its summary and chat history. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                aria-busy={deleting}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
