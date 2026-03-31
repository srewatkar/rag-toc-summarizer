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

it('renders red flags section', () => {
  render(<SummaryCard summary={summary} />)
  expect(screen.getByText('Automatic renewal with no notification')).toBeInTheDocument()
})
