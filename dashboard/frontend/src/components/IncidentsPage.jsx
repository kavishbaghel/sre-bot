import { useState, useEffect } from 'react'
import axios from 'axios'
import { AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react'

export default function IncidentsPage() {
  const [metrics, setMetrics] = useState([])
  // Filter state — show all, failures only, or successes only
  const [filter, setFilter] = useState('all')

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

  const failures = metrics.filter(m => m.success === 0)
  const successes = metrics.filter(m => m.success === 1)

  // Apply filter
  const filtered = filter === 'failures' ? failures
    : filter === 'success' ? successes
    : metrics

  return (
    <div className="space-y-4 fade-in">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-hover bg-gray-900/80 border border-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Total events</span>
          </div>
          <p className="text-2xl font-bold">{metrics.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">Last 60 minutes</p>
        </div>
        <div className="card-hover bg-gray-900/80 border border-red-500/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Failures</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{failures.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {failures.length > 0 ? `${((failures.length / metrics.length) * 100).toFixed(0)}% of total` : 'No failures'}
          </p>
        </div>
        <div className="card-hover bg-gray-900/80 border border-emerald-500/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Successful</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{successes.length}</p>
          <p className="text-[11px] text-gray-500 mt-1">
            {successes.length > 0 ? `${((successes.length / metrics.length) * 100).toFixed(0)}% of total` : 'No successes'}
          </p>
        </div>
      </div>

      {/* Timeline with filter */}
      <div className="bg-gray-900/80 border border-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="px-5 py-3.5 border-b border-gray-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Event timeline</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">Real-time infrastructure events</p>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-0.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'failures', label: 'Failures' },
              { id: 'success', label: 'Success' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors font-medium ${
                  filter === f.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-800/30 max-h-[500px] overflow-y-auto">
          {filtered.map((m, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-800/20 transition-colors">
              {m.success === 1 ? (
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-200 font-medium">
                    {m.success === 1 ? 'Scrape successful' : 'Scrape failed'}
                  </p>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {new Date(m.scraped_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 font-mono truncate">{m.target}</p>
                {m.error && (
                  <div className="mt-1.5 bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5">
                    <p className="text-[11px] text-red-400/80 truncate">{m.error}</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-10 text-center">
              <Filter className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No events match this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}