import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadText, uploadUrl, uploadFile, listDocuments, getDocument, deleteDocument, deleteAccount, chat } from '../../lib/api'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  vi.stubEnv('VITE_API_URL', 'http://localhost:8000')
})

// ── uploadText ───────────────────────────────────────────────────────────────

describe('uploadText', () => {
  it('posts FormData to /upload and returns document_id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ document_id: 'doc-1' }) })
    const result = await uploadText('some content', 'Bearer token')
    expect(result.document_id).toBe('doc-1')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/upload',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws with status on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Rate limit exceeded' }),
    })
    // attach status via json response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ detail: 'Rate limit exceeded' }),
    })
    await expect(uploadText('content', 'Bearer token')).rejects.toMatchObject({
      message: 'Rate limit exceeded',
      status: 429,
    })
  })
})

// ── uploadUrl ────────────────────────────────────────────────────────────────

describe('uploadUrl', () => {
  it('posts url to /upload', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ document_id: 'doc-2' }) })
    const result = await uploadUrl('https://example.com/terms', 'Bearer token')
    expect(result.document_id).toBe('doc-2')
  })
})

// ── uploadFile ───────────────────────────────────────────────────────────────

describe('uploadFile', () => {
  it('posts file to /upload', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ document_id: 'doc-3' }) })
    const file = new File(['content'], 'terms.pdf', { type: 'application/pdf' })
    const result = await uploadFile(file, 'Bearer token')
    expect(result.document_id).toBe('doc-3')
  })
})

// ── listDocuments ─────────────────────────────────────────────────────────────

describe('listDocuments', () => {
  it('fetches document list', async () => {
    const docs = [{ id: 'doc-1', title: 'Terms', status: 'ready' }]
    mockFetch.mockResolvedValue({ ok: true, json: async () => docs })
    const result = await listDocuments('Bearer token')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('doc-1')
  })
})

// ── getDocument ───────────────────────────────────────────────────────────────

describe('getDocument', () => {
  it('fetches document by id', async () => {
    const doc = { document: { id: 'doc-1' }, summary: null, messages: [] }
    mockFetch.mockResolvedValue({ ok: true, json: async () => doc })
    const result = await getDocument('doc-1', 'Bearer token')
    expect(result.document.id).toBe('doc-1')
  })
})

// ── deleteDocument ────────────────────────────────────────────────────────────

describe('deleteDocument', () => {
  it('sends DELETE request to /documents/:id', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    await deleteDocument('doc-1', 'Bearer token')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/documents/doc-1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(deleteDocument('doc-1', 'Bearer token')).rejects.toThrow('Delete failed')
  })
})

// ── deleteAccount ─────────────────────────────────────────────────────────────

describe('deleteAccount', () => {
  it('sends DELETE request to /account', async () => {
    mockFetch.mockResolvedValue({ ok: true })
    await deleteAccount('Bearer token')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/account',
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('throws on failure', async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(deleteAccount('Bearer token')).rejects.toThrow('Failed to delete account')
  })
})

// ── chat ──────────────────────────────────────────────────────────────────────

describe('chat', () => {
  it('posts question and returns answer', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ answer: 'You cannot cancel.' }) })
    const result = await chat('doc-1', 'Can I cancel?', 'Bearer token')
    expect(result.answer).toBe('You cannot cancel.')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/chat',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Document not found' }),
    })
    await expect(chat('bad-id', 'question', 'Bearer token')).rejects.toThrow('Document not found')
  })
})
