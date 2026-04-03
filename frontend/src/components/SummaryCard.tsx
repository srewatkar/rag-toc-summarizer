import { useState } from 'react'

type Summary = {
  overview: string
  key_points: string[]
  red_flags: string[]
  watch_out: string[]
}

function CollapsibleSection({
  id,
  title,
  label,
  count,
  defaultOpen = true,
  className,
  headerClass,
  children,
}: {
  id: string
  title: React.ReactNode
  label: string
  count: number
  defaultOpen?: boolean
  className?: string
  headerClass?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={`rounded-xl border ${className}`} role="region" aria-label={label}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${headerClass}`}
      >
        <span className="font-semibold">{title}</span>
        <span className="flex items-center gap-2 text-sm font-normal opacity-60">
          {count} item{count !== 1 ? 's' : ''}
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && (
        <div id={id} className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  )
}

export default function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-700 mb-2">Overview</h2>
        <p className="text-gray-800">{summary.overview}</p>
      </div>

      {summary.key_points.length > 0 && (
        <CollapsibleSection
          id="key-points-list"
          title="Key Points"
          label="Key Points"
          count={summary.key_points.length}
          className="bg-white"
          headerClass="text-gray-700"
        >
          <ul className="space-y-2">
            {summary.key_points.map((pt, i) => (
              <li key={i} className="flex gap-2 text-gray-800">
                <span aria-hidden="true" className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {summary.red_flags.length > 0 && (
        <CollapsibleSection
          id="red-flags-list"
          title={<><span aria-hidden="true">🚩 </span>Red Flags</>}
          label="Red Flags"
          count={summary.red_flags.length}
          className="bg-red-50 border-red-200"
          headerClass="text-red-700"
        >
          <ul className="space-y-2">
            {summary.red_flags.map((flag, i) => (
              <li key={i} className="flex gap-2 text-red-800">
                <span aria-hidden="true" className="flex-shrink-0">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {summary.watch_out.length > 0 && (
        <CollapsibleSection
          id="watch-out-list"
          title={<><span aria-hidden="true">⚠️ </span>Watch Out For</>}
          label="Watch Out For"
          count={summary.watch_out.length}
          className="bg-yellow-50 border-yellow-200"
          headerClass="text-yellow-700"
        >
          <ul className="space-y-2">
            {summary.watch_out.map((item, i) => (
              <li key={i} className="flex gap-2 text-yellow-800">
                <span aria-hidden="true" className="flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  )
}
