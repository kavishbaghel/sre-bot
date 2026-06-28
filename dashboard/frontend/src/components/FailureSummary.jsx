import { useState, useEffect } from 'react'
import axios from 'axios'

export default function FailureSummary() {
  const [failures, setFailures] = useState([])

  useEffect(() => {
    const fetchFailures = async () => {
      try {
        // Call our Go backend's failure summary endpoint
        // We need to add this endpoint — we'll use /api/metrics for now
        // and extract unique errors
        const res = await axios.get('/api/metrics?minutes=60')
        const data = res.data || []

        // Group errors by message and count occurrences
        // reduce() is JavaScript's equivalent of iterating and accumulating
        // acc = accumulator (starts as {}), m = current metric
        const errorCounts = data.reduce((acc, m) => {
          if (m.error && m.success === 0) {
            // If this error already exists in acc, increment count
            // If not, start at 1
            acc[m.error] = (acc[m.error] || 0) + 1
          }
          return acc
        }, {})

        // Convert the object to an array of { error, count } for rendering
        // Object.entries converts { key: value } to [[key, value], ...]
        const sorted = Object.entries(errorCounts)
          .map(([error, count]) => ({ error, count }))
          .sort((a, b) => b.count - a.count)

        setFailures(sorted)
      } catch (err) {
        console.error('Failed to fetch failure summary:', err)
      }
    }
    fetchFailures()
    const interval = setInterval(fetchFailures, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold">Failure breakdown</h2>
        <p className="text-xs text-gray-500 mt-0.5">Last 60 minutes</p>
      </div>

      {failures.length > 0 ? (
        <div className="p-4 space-y-3">
          {failures.map((f, i) => {
            // Calculate the percentage width for the bar visualization
            // The first item (highest count) gets 100% width, others are proportional
            const maxCount = failures[0].count
            const percentage = (f.count / maxCount) * 100

            return (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  {/* Truncate long error messages */}
                  <p className="text-xs text-gray-400 truncate max-w-[80%]" title={f.error}>
                    {f.error}
                  </p>
                  <span className="text-xs font-mono text-gray-300">{f.count}</span>
                </div>
                {/* Visual bar — width proportional to count */}
                {/* Inline style for dynamic width — Tailwind can't do arbitrary percentages */}
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-red-500/60 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">No failures recorded</p>
        </div>
      )}
    </div>
  )
}