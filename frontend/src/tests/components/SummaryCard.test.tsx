import { render, screen } from '@testing-library/react'
import SummaryCard from '../../components/SummaryCard'

const summary = {
  overview: 'This is a subscription agreement.',
  key_points: ['You agree to monthly billing', 'Data may be shared with partners'],
  red_flags: ['Automatic renewal with no notification'],
  watch_out: ['30-day cancellation notice required'],
}

it('renders overview', () => {
  render(<SummaryCard summary={summary} />)
  expect(screen.getByText('This is a subscription agreement.')).toBeInTheDocument()
})

it('renders key points', () => {
  render(<SummaryCard summary={summary} />)
  expect(screen.getByText('You agree to monthly billing')).toBeInTheDocument()
  expect(screen.getByText('Data may be shared with partners')).toBeInTheDocument()
})

it('renders red flags section with accessible region label', () => {
  render(<SummaryCard summary={summary} />)
  expect(screen.getByRole('region', { name: /red flags/i })).toBeInTheDocument()
  expect(screen.getByText('Automatic renewal with no notification')).toBeInTheDocument()
})

it('renders watch out section with accessible region label', () => {
  render(<SummaryCard summary={summary} />)
  expect(screen.getByRole('region', { name: /watch out/i })).toBeInTheDocument()
  expect(screen.getByText('30-day cancellation notice required')).toBeInTheDocument()
})

it('does not render red flags section when list is empty', () => {
  render(<SummaryCard summary={{ ...summary, red_flags: [] }} />)
  expect(screen.queryByRole('region', { name: /red flags/i })).not.toBeInTheDocument()
})

it('does not render watch out section when list is empty', () => {
  render(<SummaryCard summary={{ ...summary, watch_out: [] }} />)
  expect(screen.queryByRole('region', { name: /watch out/i })).not.toBeInTheDocument()
})
