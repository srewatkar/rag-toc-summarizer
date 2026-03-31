import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import UploadForm from '../../components/UploadForm'

vi.mock('../../lib/api', () => ({
  uploadText: vi.fn().mockResolvedValue({ document_id: 'doc-1' }),
  uploadUrl: vi.fn().mockResolvedValue({ document_id: 'doc-2' }),
  uploadFile: vi.fn().mockResolvedValue({ document_id: 'doc-3' }),
}))

beforeEach(() => vi.clearAllMocks())

it('renders three tab options', () => {
  render(<UploadForm token="tok" onUploaded={vi.fn()} />)
  expect(screen.getByText('File')).toBeInTheDocument()
  expect(screen.getByText('URL')).toBeInTheDocument()
  expect(screen.getByText('Paste Text')).toBeInTheDocument()
})

it('calls onUploaded with document_id after text upload', async () => {
  const onUploaded = vi.fn()
  render(<UploadForm token="tok" onUploaded={onUploaded} />)
  fireEvent.click(screen.getByText('Paste Text'))
  fireEvent.change(screen.getByPlaceholderText(/paste your document/i), {
    target: { value: 'Some legal text here' }
  })
  fireEvent.click(screen.getByText('Analyze'))
  await waitFor(() => expect(onUploaded).toHaveBeenCalledWith('doc-1'))
})
