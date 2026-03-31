import { useState } from 'react'
import { uploadText, uploadUrl, uploadFile } from '../lib/api'

type Tab = 'file' | 'url' | 'text'

export default function UploadForm({ token, onUploaded }: { token: string; onUploaded: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>('file')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      let result
      if (tab === 'text') result = await uploadText(content, token)
      else if (tab === 'url') result = await uploadUrl(url, token)
      else if (tab === 'file' && file) result = await uploadFile(file, token)
      else throw new Error('Please provide a document')
      onUploaded(result.document_id)
    } catch (err: any) {
      setError(err.message || 'Something went wrong — try again')
      setLoading(false)
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'file', label: 'File' },
    { key: 'url', label: 'URL' },
    { key: 'text', label: 'Paste Text' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex border-b">
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'file' && (
        <input type="file" accept=".pdf,.docx" onChange={e => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700" />
      )}
      {tab === 'url' && (
        <input type="url" placeholder="https://example.com/terms" value={url} onChange={e => setUrl(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
      )}
      {tab === 'text' && (
        <textarea placeholder="Paste your document text here…" value={content} onChange={e => setContent(e.target.value)}
          rows={8} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" required />
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Uploading…' : 'Analyze'}
      </button>
    </form>
  )
}
