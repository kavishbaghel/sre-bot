import { useState, useEffect } from 'react'
import axios from 'axios'

export default function HealthCard() {
  const [health, setHealth] = useState(null)
  // Track when the last successful fetch happened
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/health')
        setHealth(res.data)
        setLastUpdated(new Date())
      } catch (err) {
        console.error('Failed to fetch health:', err)
      }
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  if (!health) {
    return (
      // Skeleton loading state — gray boxes that pulse
      <div className="grid grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl h-28" />
        ))}
      </div>
    )
  }

  // Define the three stat cards — array of objects makes it easy to map over
  const stats = [
    {
      label: 'System status',
      value: health.healthy ? 'Healthy' : 'Unhealthy',
      // Template literal for dynamic class names based on health status
      color: health.healthy ? 'text-green-400' : 'text-red-400',
      bg: health.healthy ? 'bg-green-400/10 border-green-400/20' : 'bg-red-400/10 border-red-400/20',
      sub: lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : '',
    },
    {
      label: 'Total scrapes',
      value: health.total.toLocaleString(),
      color: 'text-blue-400',
      bg: 'bg-gray-900 border-gray-800',
      sub: `${health.failures} failures`,
    },
    {
      label: 'Failure rate',
      value: `${(health.failure_rate * 100).toFixed(1)}%`,
      // Change color based on severity thresholds
      color: health.failure_rate > 0.5 ? 'text-red-400' : health.failure_rate > 0.2 ? 'text-amber-400' : 'text-green-400',
      bg: 'bg-gray-900 border-gray-800',
      sub: 'Last 5 minutes',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className={`rounded-xl border p-4 ${stat.bg}`}>
          <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-gray-500 mt-2">{stat.sub}</p>
        </div>
      ))}
    </div>
  )
}