import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Dashboard from '../../pages/Dashboard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'tok' } },
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { email: 'alice@example.com', user_metadata: { full_name: 'Alice Smith' } } },
      }),
      signOut: vi.fn().mockResolvedValue({}),
    },
  },
}))

vi.mock('../../lib/api', () => ({
  listDocuments: vi.fn().mockResolvedValue([
    { id: 'doc-1', title: 'Test T&C', status: 'ready', created_at: '2026-01-01T00:00:00Z' },
  ]),
  deleteDocument: vi.fn().mockResolvedValue(undefined),
}))

// ── Rendering ────────────────────────────────────────────────────────────────

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

it('shows personalised greeting when user has a name', async () => {
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/alice/i)).toBeInTheDocument())
})

// ── Navigation ───────────────────────────────────────────────────────────────

it('renders upload and profile links', async () => {
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  await waitFor(() => screen.getByText('Test T&C'))
  expect(screen.getByRole('link', { name: /upload/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument()
})

it('signs out and navigates to login', async () => {
  const { supabase } = await import('../../lib/supabase')
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  await waitFor(() => screen.getByText('Test T&C'))
  fireEvent.click(screen.getByRole('button', { name: /sign out/i }))
  await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalled())
  expect(mockNavigate).toHaveBeenCalledWith('/login')
})

// ── Delete ───────────────────────────────────────────────────────────────────

it('removes document from list after delete', async () => {
  render(<MemoryRouter><Dashboard /></MemoryRouter>)
  await waitFor(() => screen.getByText('Test T&C'))
  fireEvent.click(screen.getByRole('button', { name: /delete "test t&c"/i }))
  await waitFor(() => expect(screen.queryByText('Test T&C')).not.toBeInTheDocument())
})
