import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import UploadForm from '../../components/UploadForm'

vi.mock('../../lib/api', () => ({
  uploadText: vi.fn().mockResolvedValue({ document_id: 'doc-1' }),
  uploadUrl: vi.fn().mockResolvedValue({ document_id: 'doc-2' }),
  uploadFile: vi.fn().mockResolvedValue({ document_id: 'doc-3' }),
}))

beforeEach(() => vi.clearAllMocks())

const LONG_TEXT = 'This is a legal document with enough content to pass the minimum length validation requirement for analysis.'

// ── Tab rendering ────────────────────────────────────────────────────────────

it('renders three tabs with correct ARIA roles', () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  expect(screen.getByRole('tablist')).toBeInTheDocument()
  const tabs = screen.getAllByRole('tab')
  expect(tabs).toHaveLength(3)
  expect(tabs[0]).toHaveTextContent('File')
  expect(tabs[1]).toHaveTextContent('URL')
  expect(tabs[2]).toHaveTextContent('Paste Text')
})

it('first tab is selected by default', () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  const tabs = screen.getAllByRole('tab')
  expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
  expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
})

it('switches tab on click and updates aria-selected', () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  fireEvent.click(screen.getByRole('tab', { name: 'Paste Text' }))
  const tabs = screen.getAllByRole('tab')
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
  expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
})

// ── Client-side validation ───────────────────────────────────────────────────

it('shows error with role="alert" when text is too short', async () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  fireEvent.click(screen.getByRole('tab', { name: 'Paste Text' }))
  fireEvent.change(screen.getByPlaceholderText(/paste your document/i), {
    target: { value: 'Too short' },
  })
  fireEvent.click(screen.getByRole('button', { name: /analyze document/i }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(/too short/i)
})

it('shows error when no file selected and File tab submitted', async () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  fireEvent.click(screen.getByRole('button', { name: /analyze document/i }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(/select a pdf/i)
})

it('shows error when URL tab submitted empty', async () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  fireEvent.click(screen.getByRole('tab', { name: 'URL' }))
  fireEvent.click(screen.getByRole('button', { name: /analyze document/i }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(/enter a url/i)
})

// ── Successful uploads ───────────────────────────────────────────────────────

it('calls onUploaded after successful text upload', async () => {
  const onUploaded = vi.fn()
  render(<UploadForm token="tok" onUploaded={onUploaded} />)
  fireEvent.click(screen.getByRole('tab', { name: 'Paste Text' }))
  fireEvent.change(screen.getByPlaceholderText(/paste your document/i), {
    target: { value: LONG_TEXT },
  })
  fireEvent.click(screen.getByRole('button', { name: /analyze document/i }))
  await waitFor(() => expect(onUploaded).toHaveBeenCalledWith('doc-1'))
})

it('calls onUploaded after successful URL upload', async () => {
  const onUploaded = vi.fn()
  render(<UploadForm token="tok" onUploaded={onUploaded} />)
  fireEvent.click(screen.getByRole('tab', { name: 'URL' }))
  fireEvent.change(screen.getByPlaceholderText(/https/i), {
    target: { value: 'https://example.com/terms' },
  })
  fireEvent.click(screen.getByRole('button', { name: /analyze document/i }))
  await waitFor(() => expect(onUploaded).toHaveBeenCalledWith('doc-2'))
})

// ── API error handling ───────────────────────────────────────────────────────

it('shows rate-limit message on 429 from API', async () => {
  const { uploadText } = await import('../../lib/api')
  vi.mocked(uploadText).mockRejectedValueOnce(
    Object.assign(new Error('Rate limited'), { status: 429 })
  )
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  fireEvent.click(screen.getByRole('tab', { name: 'Paste Text' }))
  fireEvent.change(screen.getByPlaceholderText(/paste your document/i), {
    target: { value: LONG_TEXT },
  })
  fireEvent.click(screen.getByRole('button', { name: /analyze document/i }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent(/daily limit/i)
})
