import { useState, useEffect } from 'react'
import axios from 'axios'
import { Heart, Database, AlertTriangle, TrendingUp } from 'lucide-react'

export default function StatsBar() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/health')
        setHealth(res.data)
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
      <div className="grid grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl h-24" />
        ))}
      </div>
    )
  }

  // Define all four stat cards as an array
  // Each card has an icon, label, value, trend indicator, and color scheme
  const stats = [
    {
      icon: Heart,
      label: 'System health',
      value: health.healthy ? 'Operational' : 'Degraded',
      sub: health.healthy ? 'All services running' : 'Issues detected',
      iconColor: health.healthy ? 'text-green-400' : 'text-red-400',
      iconBg: health.healthy ? 'bg-green-400/10' : 'bg-red-400/10',
      valueColor: health.healthy ? 'text-green-400' : 'text-red-400',
    },
    {
      icon: Database,
      label: 'Total scrapes',
      value: health.total.toLocaleString(),
      sub: 'Last 5 minutes',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-400/10',
      valueColor: 'text-white',
    },
    {
      icon: AlertTriangle,
      label: 'Failures',
      value: health.failures.toLocaleString(),
      sub: health.failures > 0 ? 'Needs attention' : 'No failures',
      iconColor: health.failures > 0 ? 'text-amber-400' : 'text-green-400',
      iconBg: health.failures > 0 ? 'bg-amber-400/10' : 'bg-green-400/10',
      valueColor: health.failures > 0 ? 'text-amber-400' : 'text-white',
    },
    {
      icon: TrendingUp,
      label: 'Failure rate',
      value: `${(health.failure_rate * 100).toFixed(1)}%`,
      sub: health.failure_rate > 0.5 ? 'Critical' : health.failure_rate > 0.2 ? 'Warning' : 'Normal',
      iconColor: health.failure_rate > 0.5 ? 'text-red-400' : health.failure_rate > 0.2 ? 'text-amber-400' : 'text-green-400',
      iconBg: health.failure_rate > 0.5 ? 'bg-red-400/10' : health.failure_rate > 0.2 ? 'bg-amber-400/10' : 'bg-green-400/10',
      valueColor: health.failure_rate > 0.5 ? 'text-red-400' : 'text-white',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">{stat.label}</span>
              {/* Icon with colored background circle */}
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className={`text-xl font-bold ${stat.valueColor}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
          </div>
        )
      })}
    </div>
  )
}