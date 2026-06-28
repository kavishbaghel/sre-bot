import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  ExternalLink,
} from 'lucide-react'

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className={`bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800/50">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight">sre-bot</span>
              <span className="text-[9px] text-gray-500 ml-1.5 bg-gray-800 px-1.5 py-0.5 rounded font-mono">v0.2</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
            <Activity className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">Navigation</p>
        </div>
      )}

      <nav className="flex-1 py-1 px-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400 shadow-sm shadow-blue-500/5'
                  : 'text-gray-500 hover:bg-gray-800/70 hover:text-gray-300'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1 h-1 rounded-full bg-blue-400" />
              )}
            </button>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 space-y-2 border-t border-gray-800/50">
          <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-800/50">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Environment</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-xs text-gray-300">Production</p>
            </div>
          </div>
          
            <a href="https://github.com/kavishbaghel/sre-bot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-2.5 py-2 text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      )}
    </aside>
  )
}