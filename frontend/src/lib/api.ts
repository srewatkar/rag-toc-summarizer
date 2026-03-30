function getApiUrl() {
  return import.meta.env.VITE_API_URL
}

async function request(path: string, options: RequestInit, token: string) {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: { 'Authorization': token, 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw Object.assign(new Error(err.detail || 'Request failed'), { status: res.status })
  }
  return res
}

export async function uploadText(content: string, token: string) {
  const res = await fetch(`${getApiUrl()}/upload`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_type: 'text', content }),
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function uploadUrl(url: string, token: string) {
  const res = await fetch(`${getApiUrl()}/upload`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_type: 'url', url }),
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function uploadFile(file: File, token: string) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${getApiUrl()}/upload`, {
    method: 'POST',
    headers: { Authorization: token },
    body: form,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export async function listDocuments(token: string) {
  const res = await request('/documents', { method: 'GET' }, token)
  return res.json()
}

export async function getDocument(id: string, token: string) {
  const res = await request(`/documents/${id}`, { method: 'GET' }, token)
  return res.json()
}

export async function deleteDocument(id: string, token: string) {
  const res = await fetch(`${getApiUrl()}/documents/${id}`, {
    method: 'DELETE',
    headers: { Authorization: token },
  })
  if (!res.ok) throw new Error('Delete failed')
}

export async function chat(documentId: string, question: string, token: string) {
  const res = await request('/chat', {
    method: 'POST',
    body: JSON.stringify({ document_id: documentId, question }),
  }, token)
  return res.json()
}
