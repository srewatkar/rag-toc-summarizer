import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadText, uploadUrl, listDocuments, getDocument, deleteDocument, chat } from '../../lib/api'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  vi.stubEnv('VITE_API_URL', 'http://localhost:8000')
})

describe('uploadText', () => {
  it('posts to /upload and returns document_id', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ document_id: 'doc-1' }) })
    const result = await uploadText('some content', 'Bearer token')
    expect(result.document_id).toBe('doc-1')
    expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/upload', expect.objectContaining({ method: 'POST' }))
  })
})

describe('uploadUrl', () => {
  it('posts url to /upload', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ document_id: 'doc-2' }) })
    const result = await uploadUrl('https://example.com/terms', 'Bearer token')
    expect(result.document_id).toBe('doc-2')
  })
})

describe('listDocuments', () => {
  it('fetches document list', async () => {
    const docs = [{ id: 'doc-1', title: 'Terms', status: 'ready' }]
    mockFetch.mockResolvedValue({ ok: true, json: async () => docs })
    const result = await listDocuments('Bearer token')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('doc-1')
  })
})

describe('getDocument', () => {
  it('fetches document by id', async () => {
    const doc = { document: { id: 'doc-1' }, summary: null, messages: [] }
    mockFetch.mockResolvedValue({ ok: true, json: async () => doc })
    const result = await getDocument('doc-1', 'Bearer token')
    expect(result.document.id).toBe('doc-1')
  })
})

describe('deleteDocument', () => {
  it('sends DELETE request', async () => {
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
})
