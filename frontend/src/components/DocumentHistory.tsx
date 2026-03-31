import { Link } from 'react-router-dom'

type Doc = { id: string; title: string; status: string; created_at: string }

export default function DocumentHistory({ docs, onDelete }: { docs: Doc[]; onDelete: (id: string) => void }) {
  if (docs.length === 0) {
    return <p className="text-gray-500 text-center py-12">No documents yet. Upload one to get started.</p>
  }
  return (
    <ul className="divide-y divide-gray-100" aria-label="Your documents">
      {docs.map(doc => (
        <li key={doc.id} className="flex items-center justify-between py-4 px-2 hover:bg-gray-50 rounded-lg">
          <Link to={`/documents/${doc.id}`} className="flex-1 min-w-0 mr-4">
            <p className="font-medium text-gray-900 truncate">{doc.title}</p>
            <p className="text-sm text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
          </Link>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                doc.status === 'ready'      ? 'bg-green-100 text-green-700' :
                doc.status === 'error'      ? 'bg-red-100 text-red-700' :
                                              'bg-yellow-100 text-yellow-700'
              }`}
              aria-label={`Status: ${doc.status}`}
            >
              {doc.status}
            </span>
            <button
              type="button"
              onClick={() => onDelete(doc.id)}
              aria-label={`Delete "${doc.title}"`}
              className="text-gray-500 hover:text-red-500 text-sm min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
