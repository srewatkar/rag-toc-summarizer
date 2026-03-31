import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Dashboard from '../../pages/Dashboard'

vi.mock('../../lib/supabase', () => ({
  supabase: { auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'tok' } } }) } }
}))
vi.mock('../../lib/api', () => ({
  listDocuments: vi.fn().mockResolvedValue([
    { id: 'doc-1', title: 'Test T&C', status: 'ready', created_at: '2026-01-01T00:00:00Z' }
  ])
}))

it('shows document list', async () => {
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText('Test T&C')).toBeInTheDocument())
})

it('shows empty state when no documents', async () => {
  const { listDocuments } = await import('../../lib/api')
  vi.mocked(listDocuments).mockResolvedValueOnce([])
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/no documents/i)).toBeInTheDocument())
})
