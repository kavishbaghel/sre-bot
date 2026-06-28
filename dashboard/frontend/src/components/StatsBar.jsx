import { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, Database, AlertTriangle, Activity } from 'lucide-react'

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
          <div key={i} className="bg-gray-900/80 border border-gray-800/50 rounded-xl h-[104px]" />
        ))}
      </div>
    )
  }

  const stats = [
    {
      icon: Shield,
      label: 'System health',
      value: health.healthy ? 'Operational' : 'Degraded',
      sub: health.healthy ? 'All checks passing' : 'Action required',
      iconColor: health.healthy ? 'text-emerald-400' : 'text-red-400',
      iconBg: health.healthy ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20',
      valueColor: health.healthy ? 'text-emerald-400' : 'text-red-400',
      glow: health.healthy ? 'glow-green' : 'glow-red',
    },
    {
      icon: Database,
      label: 'Total scrapes',
      value: health.total.toLocaleString(),
      sub: 'Last 5 minutes',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      valueColor: 'text-white',
      glow: '',
    },
    {
      icon: AlertTriangle,
      label: 'Failures',
      value: health.failures.toLocaleString(),
      sub: health.failures > 0 ? 'Needs investigation' : 'No issues detected',
      iconColor: health.failures > 0 ? 'text-amber-400' : 'text-emerald-400',
      iconBg: health.failures > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
      valueColor: health.failures > 0 ? 'text-amber-400' : 'text-white',
      glow: '',
    },
    {
      icon: Activity,
      label: 'Failure rate',
      value: `${(health.failure_rate * 100).toFixed(1)}%`,
      sub: health.failure_rate > 0.5 ? 'Critical threshold' : health.failure_rate > 0.2 ? 'Elevated' : 'Within limits',
      iconColor: health.failure_rate > 0.5 ? 'text-red-400' : health.failure_rate > 0.2 ? 'text-amber-400' : 'text-emerald-400',
      iconBg: health.failure_rate > 0.5 ? 'bg-red-500/10 border-red-500/20' : health.failure_rate > 0.2 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20',
      valueColor: health.failure_rate > 0.5 ? 'text-red-400' : 'text-white',
      glow: '',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div key={i} className="card-hover bg-gray-900/80 border border-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg border ${stat.iconBg} flex items-center justify-center ${stat.glow}`}>
                <Icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className={`text-[22px] font-bold tracking-tight ${stat.valueColor}`}>{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-1.5">{stat.sub}</p>
          </div>
        )
      })}
    </div>
  )
}