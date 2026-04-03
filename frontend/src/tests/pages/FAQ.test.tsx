import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FAQ from '../../pages/FAQ'

function renderFAQ() {
  return render(<MemoryRouter><FAQ /></MemoryRouter>)
}

// ── Rendering ────────────────────────────────────────────────────────────────

it('renders the FAQ heading', () => {
  renderFAQ()
  expect(screen.getByRole('heading', { name: /frequently asked questions/i })).toBeInTheDocument()
})

it('renders all four sections', () => {
  renderFAQ()
  expect(screen.getByText('Getting Started')).toBeInTheDocument()
  expect(screen.getByText('Usage & Limits')).toBeInTheDocument()
  expect(screen.getByText('Privacy & Security')).toBeInTheDocument()
  expect(screen.getByText('Accuracy & Limitations')).toBeInTheDocument()
})

it('renders FAQ items as collapsed buttons with aria-expanded=false', () => {
  renderFAQ()
  const buttons = screen.getAllByRole('button').filter(b =>
    b.getAttribute('aria-expanded') !== null
  )
  expect(buttons.length).toBeGreaterThan(0)
  buttons.forEach(b => expect(b).toHaveAttribute('aria-expanded', 'false'))
})

// ── Accordion interaction ─────────────────────────────────────────────────────

it('expands an item on click and shows the answer', () => {
  renderFAQ()
  const btn = screen.getByRole('button', { name: /what is clauseai/i })
  expect(btn).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(btn)
  expect(btn).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(/AI-powered legal document analyzer/i)).toBeInTheDocument()
})

it('collapses an expanded item on second click', () => {
  renderFAQ()
  const btn = screen.getByRole('button', { name: /what is clauseai/i })
  fireEvent.click(btn)
  expect(screen.getByText(/AI-powered legal document analyzer/i)).toBeInTheDocument()
  fireEvent.click(btn)
  expect(screen.queryByText(/AI-powered legal document analyzer/i)).not.toBeInTheDocument()
})

// ── Contact form ──────────────────────────────────────────────────────────────

it('renders the contact form with email and message fields', () => {
  renderFAQ()
  expect(screen.getByLabelText(/your email/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument()
})

it('shows confirmation after contact form submit', () => {
  renderFAQ()
  fireEvent.change(screen.getByLabelText(/your email/i), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Hello there' } })
  fireEvent.submit(screen.getByRole('button', { name: /send message/i }).closest('form')!)
  expect(screen.getByRole('status')).toBeInTheDocument()
  expect(screen.getByText(/message ready to send/i)).toBeInTheDocument()
})

// ── Navigation ────────────────────────────────────────────────────────────────

it('has a link back to home', () => {
  renderFAQ()
  expect(screen.getByRole('link', { name: /clauseai/i })).toHaveAttribute('href', '/')
})
