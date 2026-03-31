import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import ChatInterface from '../../components/ChatInterface'

vi.mock('../../lib/api', () => ({
  chat: vi.fn().mockResolvedValue({ answer: 'Answer here' }),
}))

beforeEach(() => vi.clearAllMocks())

it('renders existing messages', () => {
  const messages = [
    { role: 'user', content: 'Can I cancel?', created_at: '2026-01-01' },
    { role: 'assistant', content: 'Yes, with 30 days notice.', created_at: '2026-01-01' },
  ]
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={messages} />)
  expect(screen.getByText('Can I cancel?')).toBeInTheDocument()
  expect(screen.getByText('Yes, with 30 days notice.')).toBeInTheDocument()
})

it('shows assistant reply after send', async () => {
  render(<ChatInterface documentId="doc-1" token="tok" initialMessages={[]} />)
  const input = screen.getByPlaceholderText(/ask a question/i)
  fireEvent.change(input, { target: { value: 'My question' } })
  fireEvent.submit(input.closest('form')!)
  await waitFor(() => expect(screen.getByText('Answer here')).toBeInTheDocument())
  expect((input as HTMLInputElement).value).toBe('')
})
