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
      <main id="main-content" className="max-w-3xl mx-auto py-8 px-4 sm:py-12">
        {/* Header — stacks on mobile, side-by-side on sm+ */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1" aria-live="polite">{getGreeting(name)}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Documents</h1>
          </div>
          <nav aria-label="Dashboard actions" className="flex items-center gap-2 flex-wrap">
            <Link
              to="/upload"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 min-h-[44px] flex items-center"
            >
              + Upload
            </Link>
            <Link
              to="/profile"
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px] flex items-center"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Sign out
            </button>
          </nav>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-12" role="status" aria-live="polite">Loading…</p>
        ) : (
          <DocumentHistory docs={docs} onDelete={handleDelete} />
        )}
      </main>
    </div>
  )
}
