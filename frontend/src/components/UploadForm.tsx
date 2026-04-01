import { useRef, useState } from 'react'
import { uploadText, uploadUrl, uploadFile } from '../lib/api'

type Tab = 'file' | 'url' | 'text'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
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

const tabs: { key: Tab; label: string }[] = [
  { key: 'file', label: 'File' },
  { key: 'url', label: 'URL' },
  { key: 'text', label: 'Paste Text' },
]

export default function UploadForm({ token, onUploaded }: { token: string; onUploaded: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>('file')
  const [content, setContent] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

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

  function handleTabKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const next = (index + 1) % tabs.length
      setTab(tabs[next].key)
      tabRefs.current[next]?.focus()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prev = (index - 1 + tabs.length) % tabs.length
      setTab(tabs[prev].key)
      tabRefs.current[prev]?.focus()
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (tab === 'file' && !file) { setError('Please select a PDF or DOCX file.'); return }
    if (tab === 'url' && !url.trim()) { setError('Please enter a URL.'); return }
    if (tab === 'text' && !content.trim()) { setError('Please paste some text.'); return }
    if (tab === 'text' && content.trim().length < 50) { setError('Text is too short to analyse — paste at least a few sentences.'); return }

    setLoading(true)
    try {
      let result
      if (tab === 'text') result = await uploadText(content, token, docTitle || undefined)
      else if (tab === 'url') result = await uploadUrl(url, token)
      else result = await uploadFile(file!, token)
      onUploaded(result.document_id)
    } catch (err: any) {
      setError(friendlyUploadError(err))
      setLoading(false)
    }
  }

  const panelId = (key: Tab) => `upload-panel-${key}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Tabs */}
      <div role="tablist" aria-label="Upload method" className="flex border-b">
        {tabs.map((t, i) => (
          <button
            key={t.key}
            ref={el => { tabRefs.current[i] = el }}
            type="button"
            role="tab"
            id={`upload-tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={panelId(t.key)}
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => { setTab(t.key); setError(''); setFileError('') }}
            onKeyDown={e => handleTabKeyDown(e, i)}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* File panel */}
      <div
        id={panelId('file')}
        role="tabpanel"
        aria-labelledby={`upload-tab-file`}
        hidden={tab !== 'file'}
      >
        {tab === 'file' && (
          <div className="space-y-1">
            <label htmlFor="file-input" className="sr-only">Select a PDF or DOCX file</label>
            <input
              id="file-input"
              type="file"
              accept={ALLOWED_EXTS.join(',')}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700"
            />
            <p className="text-xs text-gray-500">PDF or DOCX only · max 10 MB</p>
            {fileError && <p role="alert" className="text-red-600 text-sm">{fileError}</p>}
          </div>
        )}
      </div>

      {/* URL panel */}
      <div
        id={panelId('url')}
        role="tabpanel"
        aria-labelledby={`upload-tab-url`}
        hidden={tab !== 'url'}
      >
        {tab === 'url' && (
          <div className="space-y-1">
            <label htmlFor="url-input" className="sr-only">Document URL</label>
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com/terms-of-service"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500">Must be a publicly accessible URL</p>
          </div>
        )}
      </div>

      {/* Text panel */}
      <div
        id={panelId('text')}
        role="tabpanel"
        aria-labelledby={`upload-tab-text`}
        hidden={tab !== 'text'}
      >
        {tab === 'text' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="doc-title" className="text-xs font-medium text-gray-500 uppercase tracking-wide block">
                Document name <span className="font-normal normal-case text-gray-400">(optional)</span>
              </label>
              <input
                id="doc-title"
                type="text"
                placeholder="Pasted document"
                value={docTitle}
                onChange={e => setDocTitle(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="text-input" className="sr-only">Paste document text</label>
              <textarea
                id="text-input"
                placeholder="Paste your document text here…"
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
                className="w-full border rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <p className="text-xs text-gray-500">Minimum ~50 characters · no file size limit for plain text</p>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <span aria-hidden="true" className="text-red-500 mt-0.5 flex-shrink-0">⚠</span>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Limits notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <strong>Limits:</strong> 5 uploads per day · Files up to 10 MB (PDF / DOCX)
      </div>

      <button
        type="submit"
        disabled={loading || !!fileError}
        aria-busy={loading}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading…' : 'Analyze Document'}
      </button>
    </form>
  )
}
