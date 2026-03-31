import { useEffect, useState } from 'react'
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

  const name = user?.user_metadata?.full_name

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm text-gray-400 mb-1">{getGreeting(name)}</p>
            <h1 className="text-3xl font-bold text-gray-900">Your Documents</h1>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Link to="/upload"
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700">
              + Upload
            </Link>
            <Link to="/profile"
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Profile
            </Link>
            <button onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
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
