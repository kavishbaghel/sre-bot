import { useState, useEffect } from 'react'
import axios from 'axios'
import { Radio } from 'lucide-react'

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
    <div className="bg-gray-900/80 border border-gray-800/50 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-800/50">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm font-semibold">Recent metrics</h2>
          {/* Live indicator with ping animation */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>
        <span className="text-[11px] text-gray-500 font-mono">{metrics.length} events · 30m window</span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="p-5 space-y-2.5 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && metrics.length > 0 && (
        <div className="overflow-y-auto max-h-[380px]">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-900/95 backdrop-blur-sm">
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                <th className="px-5 py-2.5 text-left">Timestamp</th>
                <th className="px-5 py-2.5 text-left">Target</th>
                <th className="px-5 py-2.5 text-left">Status</th>
                <th className="px-5 py-2.5 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {metrics.map((m, i) => (
                <tr key={i} className="hover:bg-gray-800/30 transition-colors group">
                  <td className="px-5 py-2.5">
                    <span className="text-xs text-gray-400 font-mono">
                      {new Date(m.scraped_at).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="text-xs text-gray-300 font-mono truncate block max-w-[220px]">
                      {m.target}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    {m.success === 1 ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Healthy
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[11px] font-medium px-2 py-0.5 rounded-full border border-red-500/20">
                        <span className="w-1 h-1 rounded-full bg-red-400" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className="text-[11px] text-gray-500 truncate block max-w-[320px]">
                      {m.error || 'No errors'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && metrics.length === 0 && (
        <div className="p-10 text-center">
          <Radio className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No recent metrics</p>
          <p className="text-gray-600 text-xs mt-1">Waiting for collector to start scraping</p>
        </div>
      )}
    </div>
  )
}