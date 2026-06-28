// Lucide provides clean, consistent SVG icons used by most modern dashboards
// Each icon is imported by name — they render as inline SVG elements
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react'

// Props are how React passes data from parent to child components
// { activeTab, setActiveTab, collapsed, setCollapsed } are destructured from props
// This is equivalent to receiving a struct in Go and accessing its fields
export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {

  // Navigation items defined as an array of objects
  // This makes it easy to add new pages — just add an object here
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    // transition-all duration-300 = smooth width animation over 300ms when collapsing/expanding
    // w-56 = 224px wide when expanded, w-16 = 64px when collapsed
    <aside className={`bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>

      {/* Logo area */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800">
        {/* Only show text when sidebar is expanded */}
        {/* Conditional rendering with && — if left side is true, render right side */}
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-base tracking-tight">sre-bot</span>
            <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">v0.2</span>
          </div>
        )}
        {collapsed && <Activity className="w-5 h-5 text-blue-400 mx-auto" />}

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(item => {
          // Check if this item is the currently active tab
          const isActive = activeTab === item.id
          // Store the icon component in a variable so we can render it as JSX
          // In React, components stored in variables must start with uppercase
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              // Dynamic class names based on active state and collapsed state
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {/* Hide label text when collapsed */}
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom section — environment indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Environment</p>
            <p className="text-xs text-gray-300 mt-0.5">Production</p>
          </div>
        </div>
      )}
    </aside>
  )
}