import { useState, useEffect } from 'react'
import axios from 'axios'
import HealthCard from './components/HealthCard'
import MetricsFeed from './components/MetricsFeed'
import ChatWindow from './components/ChatWindow'

export default function App() {
  const [healthy, setHealthy] = useState(true)
  // Track which tab is active — dashboard is default
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/health')
        setHealthy(res.data.healthy)
      } catch (err) {
        setHealthy(false)
      }
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navigation bar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo and brand */}
            <div className="flex items-center gap-3">
              {/* Colored dot as a simple logo */}
              <div className={`w-2.5 h-2.5 rounded-full ${healthy ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-lg font-semibold tracking-tight">sre-bot</span>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">v0.2</span>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1">
              {/* Each tab button — active tab gets a highlighted style */}
              {/* onClick sets the active tab, triggering a re-render */}
              {['dashboard', 'chat'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    activeTab === tab
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  {/* Capitalize first letter */}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${healthy ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-pulse'}`} />
              <span className={`text-sm ${healthy ? 'text-green-400' : 'text-red-400'}`}>
                {healthy ? 'All systems operational' : 'Issues detected'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content — switches based on active tab */}
      <main className="max-w-7xl mx-auto p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <HealthCard />
            <MetricsFeed />
          </div>
        )}

        {activeTab === 'chat' && (
          // h-[calc(100vh-120px)] fills the remaining viewport height
          <div className="h-[calc(100vh-120px)]">
            <ChatWindow />
          </div>
        )}
      </main>
    </div>
  )
}