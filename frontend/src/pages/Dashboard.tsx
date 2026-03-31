import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { listDocuments, deleteDocument } from '../lib/api'
import DocumentHistory from '../components/DocumentHistory'

export default function Dashboard() {
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          <Link to="/upload" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700">
            + Upload
          </Link>
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
