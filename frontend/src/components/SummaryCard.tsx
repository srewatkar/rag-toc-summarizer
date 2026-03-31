type Summary = {
  overview: string
  key_points: string[]
  red_flags: string[]
  watch_out: string[]
}

export default function SummaryCard({ summary }: { summary: Summary }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-700 mb-2">Overview</h2>
        <p className="text-gray-800">{summary.overview}</p>
      </div>

      {summary.key_points.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Key Points</h2>
          <ul className="space-y-2">
            {summary.key_points.map((pt, i) => (
              <li key={i} className="flex gap-2 text-gray-800">
                <span aria-hidden="true" className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.red_flags.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-5" role="region" aria-label="Red flags">
          <h2 className="font-semibold text-red-700 mb-3">
            <span aria-hidden="true">🚩 </span>Red Flags
          </h2>
          <ul className="space-y-2">
            {summary.red_flags.map((flag, i) => (
              <li key={i} className="flex gap-2 text-red-800">
                <span aria-hidden="true" className="flex-shrink-0">•</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.watch_out.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5" role="region" aria-label="Watch out for">
          <h2 className="font-semibold text-yellow-700 mb-3">
            <span aria-hidden="true">⚠️ </span>Watch Out For
          </h2>
          <ul className="space-y-2">
            {summary.watch_out.map((item, i) => (
              <li key={i} className="flex gap-2 text-yellow-800">
                <span aria-hidden="true" className="flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
