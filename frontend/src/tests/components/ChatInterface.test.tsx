import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import ChatInterface from '../../components/ChatInterface'

vi.mock('../../lib/api', () => ({
  chat: vi.fn().mockResolvedValue({ answer: 'Answer here' }),
}))

beforeEach(() => vi.clearAllMocks())

// ── Rendering ────────────────────────────────────────────────────────────────

it('renders existing messages', () => {
  const messages = [
    { role: 'user', content: 'Can I cancel?', created_at: '2026-01-01' },
    { role: 'assistant', content: 'Yes, with 30 days notice.', created_at: '2026-01-01' },
  ]
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={messages} />)
  expect(screen.getByText('Can I cancel?')).toBeInTheDocument()
  expect(screen.getByText('Yes, with 30 days notice.')).toBeInTheDocument()
})

it('shows empty state prompt when no messages', () => {
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  expect(screen.getByText(/ask a question about this document/i)).toBeInTheDocument()
})

// ── Accessibility ────────────────────────────────────────────────────────────

it('input has an accessible label', () => {
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  expect(screen.getByLabelText(/ask a question about this document/i)).toBeInTheDocument()
})

it('message log has role="log"', () => {
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  expect(screen.getByRole('log')).toBeInTheDocument()
})

// ── Interaction ──────────────────────────────────────────────────────────────

it('shows assistant reply after send and clears input', async () => {
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  const input = screen.getByLabelText(/ask a question about this document/i)
  fireEvent.change(input, { target: { value: 'My question' } })
  fireEvent.submit(input.closest('form')!)
  await waitFor(() => expect(screen.getByText('Answer here')).toBeInTheDocument())
  expect((input as HTMLInputElement).value).toBe('')
})

it('send button is disabled when input is empty', () => {
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
})

it('does not submit when question is empty', async () => {
  const { chat } = await import('../../lib/api')
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  fireEvent.submit(screen.getByLabelText(/ask a question/i).closest('form')!)
  await waitFor(() => expect(chat).not.toHaveBeenCalled())
})
