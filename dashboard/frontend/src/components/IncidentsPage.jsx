import { useState, useEffect } from 'react'
import axios from 'axios'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

export default function IncidentsPage() {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('/api/metrics?minutes=60')
        setMetrics(res.data || [])
      } catch (err) {
        console.error('Failed to fetch incidents:', err)
      }
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [])

  // Separate metrics into failures and successes for the timeline
  const failures = metrics.filter(m => m.success === 0)
  const successes = metrics.filter(m => m.success === 1)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Total events</span>
          </div>
          <p className="text-2xl font-bold">{metrics.length}</p>
        </div>
        <div className="bg-gray-900 border border-red-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-500">Failures</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{failures.length}</p>
        </div>
        <div className="bg-gray-900 border border-green-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Successful</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{successes.length}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold">Event timeline</h2>
          <p className="text-xs text-gray-500 mt-0.5">Last 60 minutes</p>
        </div>

        <div className="divide-y divide-gray-800">
          {metrics.map((m, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-800/30 transition-colors">
              {/* Status icon */}
              {m.success === 1 ? (
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-200">
                    {m.success === 1 ? 'Scrape succeeded' : 'Scrape failed'}
                  </p>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(m.scraped_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 font-mono truncate">
                  {m.target}
                </p>
                {/* Show error message for failures */}
                {m.error && (
                  <p className="text-xs text-red-400/70 mt-1 truncate">{m.error}</p>
                )}
              </div>
            </div>
          ))}

          {metrics.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm">No events recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}