import { useState, useEffect } from 'react'
import axios from 'axios'
import Sidebar from './components/Sidebar'
import StatsBar from './components/StatsBar'
import MetricsFeed from './components/MetricsFeed'
import FailureSummary from './components/FailureSummary'
import ChatWindow from './components/ChatWindow'
import IncidentsPage from './components/IncidentsPage'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [healthy, setHealthy] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/health')
        setHealthy(res.data.healthy)
      } catch {
        setHealthy(false)
      }
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            {/* Breadcrumb-style context */}
            <span className="text-gray-700">/</span>
            <span className="text-[11px] text-gray-500">Production</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Last updated timestamp */}
            <span className="text-[11px] text-gray-600 font-mono">
              {new Date().toLocaleTimeString()}
            </span>

            {/* Status pill */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
              healthy
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-red-500/5 border-red-500/20'
            }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`pulse-ring absolute inline-flex h-full w-full rounded-full ${healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </span>
              <span className={`text-[11px] font-medium ${healthy ? 'text-emerald-400' : 'text-red-400'}`}>
                {healthy ? 'Operational' : 'Degraded'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 grid-bg">
          {activeTab === 'dashboard' && (
            <div className="space-y-4 fade-in">
              <StatsBar />
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <MetricsFeed />
                </div>
                <div className="col-span-1">
                  <FailureSummary />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && <IncidentsPage />}

          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-120px)] fade-in">
              <ChatWindow />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="fade-in bg-gray-900/80 border border-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold mb-2">Settings</h2>
              <p className="text-sm text-gray-500">Configuration options will be available in a future release.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}