import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sitemap from '../../pages/Sitemap'

function renderSitemap() {
  return render(<MemoryRouter><Sitemap /></MemoryRouter>)
}

it('renders the sitemap heading', () => {
  renderSitemap()
  expect(screen.getByRole('heading', { name: /sitemap/i })).toBeInTheDocument()
})

it('renders all three sections', () => {
  renderSitemap()
  expect(screen.getByText('Public Pages')).toBeInTheDocument()
  expect(screen.getByText('Account')).toBeInTheDocument()
  expect(screen.getByText(/app \(requires sign in\)/i)).toBeInTheDocument()
})

it('renders key page links', () => {
  renderSitemap()
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument()
})

it('links to sitemap.xml', () => {
  renderSitemap()
  expect(screen.getByRole('link', { name: /sitemap\.xml/i })).toHaveAttribute('href', '/sitemap.xml')
})
