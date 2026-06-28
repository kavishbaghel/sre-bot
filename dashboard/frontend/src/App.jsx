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
  // Sidebar starts expanded on desktop
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
    // flex = sidebar and main content sit side by side
    // h-screen = fill the entire viewport height
    <div className="flex h-screen bg-gray-950 text-gray-100">

      {/* Sidebar — receives state as props */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          {/* Page title — changes based on active tab */}
          <h1 className="text-sm font-semibold">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'incidents' && 'Incidents'}
            {activeTab === 'chat' && 'Chat'}
            {activeTab === 'settings' && 'Settings'}
          </h1>

          {/* Right side — status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Animated pulse dot for live status */}
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthy ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${healthy ? 'bg-green-500' : 'bg-red-500'}`} />
              </span>
              <span className={`text-xs ${healthy ? 'text-green-400' : 'text-red-400'}`}>
                {healthy ? 'All systems operational' : 'Issues detected'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard page */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <StatsBar />
              {/* Two column layout — metrics table wider, failure summary narrower */}
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

          {/* Incidents page */}
          {activeTab === 'incidents' && <IncidentsPage />}

          {/* Chat page */}
          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-120px)]">
              <ChatWindow />
            </div>
          )}

          {/* Settings page — placeholder for now */}
          {activeTab === 'settings' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold mb-4">Settings</h2>
              <p className="text-sm text-gray-500">Configuration options will be available in a future release.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}