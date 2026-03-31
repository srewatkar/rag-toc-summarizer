import { useState } from 'react'
import { uploadText, uploadUrl, uploadFile } from '../lib/api'

type Tab = 'file' | 'url' | 'text'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTS = ['.pdf', '.docx']

function friendlyUploadError(err: any): string {
  const status = err?.status
  const detail = err?.message || ''

  if (status === 429) return "You've reached the daily limit of 5 uploads. Try again tomorrow."
  if (status === 413) return 'File exceeds the 10 MB limit. Please use a smaller file.'
  if (status === 400) return detail || 'Invalid input — check your file or URL and try again.'
  if (status === 401 || status === 403) return 'Session expired. Please log in again.'
  return detail || 'Something went wrong — please try again.'
}

export default function UploadForm({ token, onUploaded }: { token: string; onUploaded: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>('file')
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null
    setFileError('')
    setFile(null)

    if (!selected) return

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('Only PDF and DOCX files are accepted.')
      e.target.value = ''
      return
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFileError(`File is too large (${(selected.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`)
      e.target.value = ''
      return
    }
    setFile(selected)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side guards before hitting the network
    if (tab === 'file') {
      if (!file) { setError('Please select a PDF or DOCX file.'); return }
    } else if (tab === 'url') {
      if (!url.trim()) { setError('Please enter a URL.'); return }
    } else if (tab === 'text') {
      if (!content.trim()) { setError('Please paste some text.'); return }
      if (content.trim().length < 50) { setError('Text is too short to analyse — paste at least a few sentences.'); return }
    }

    setLoading(true)
    try {
      let result
      if (tab === 'text') result = await uploadText(content, token)
      else if (tab === 'url') result = await uploadUrl(url, token)
      else result = await uploadFile(file!, token)
      onUploaded(result.document_id)
    } catch (err: any) {
      setError(friendlyUploadError(err))
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
          <button key={t.key} type="button" onClick={() => { setTab(t.key); setError(''); setFileError('') }}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'file' && (
        <div className="space-y-1">
          <input type="file" accept={ALLOWED_EXTS.join(',')} onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700" />
          <p className="text-xs text-gray-400">PDF or DOCX only · max 10 MB</p>
          {fileError && <p className="text-red-600 text-sm">{fileError}</p>}
        </div>
      )}
      {tab === 'url' && (
        <div className="space-y-1">
          <input type="url" placeholder="https://example.com/terms-of-service" value={url} onChange={e => setUrl(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <p className="text-xs text-gray-400">Must be a publicly accessible URL</p>
        </div>
      )}
      {tab === 'text' && (
        <div className="space-y-1">
          <textarea placeholder="Paste your document text here…" value={content} onChange={e => setContent(e.target.value)}
            rows={8} className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm" />
          <p className="text-xs text-gray-400">Minimum ~50 characters · no file size limit for plain text</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <span className="text-red-500 mt-0.5">&#9888;</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <strong>Limits:</strong> 5 uploads per day · Files up to 10 MB (PDF / DOCX)
      </div>

      <button type="submit" disabled={loading || !!fileError}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Uploading…' : 'Analyze Document'}
      </button>
    </form>
  )
}
