import { useState, useEffect } from 'react'
import axios from 'axios'

export default function MetricsFeed() {
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('/api/metrics?minutes=30')
        setMetrics(res.data || [])
      } catch (err) {
        console.error('Failed to fetch metrics:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
    const interval = setInterval(fetchMetrics, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Table header bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Recent metrics</h2>
          {/* Live indicator dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </div>
        <span className="text-xs text-gray-500">{metrics.length} results · last 30 min</span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="p-4 space-y-2 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 bg-gray-800 rounded" />
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && metrics.length > 0 && (
        <div className="overflow-y-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-900">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Target</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {metrics.map((m, i) => (
                <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">
                    {new Date(m.scraped_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2.5 text-gray-300 font-mono text-xs truncate max-w-[250px]">
                    {m.target}
                  </td>
                  <td className="px-4 py-2.5">
                    {m.success === 1 ? (
                      <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-[350px]">
                    {m.error || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && metrics.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm">No recent metrics available</p>
          <p className="text-gray-600 text-xs mt-1">Data will appear when the collector starts scraping</p>
        </div>
      )}
    </div>
  )
}