import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { listDocuments, deleteDocument } from '../lib/api'
import DocumentHistory from '../components/DocumentHistory'

export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const data = await listDocuments(`Bearer ${session.access_token}`)
      setDocs(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDelete(id: string) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await deleteDocument(id, `Bearer ${session.access_token}`)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <div className="flex items-center gap-3">
            <Link to="/upload" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700">
              + Upload
            </Link>
            <button onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              Sign out
            </button>
          </div>
        </div>
        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading…</p>
        ) : (
          <DocumentHistory docs={docs} onDelete={handleDelete} />
        )}
      </div>
    </div>
  )
}
