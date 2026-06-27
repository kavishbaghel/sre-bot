// Import the three components we just created
// In React, each component lives in its own file and is imported by name
import HealthCard from './components/HealthCard'
import MetricsFeed from './components/MetricsFeed'
import ChatWindow from './components/ChatWindow'

// This is the root component — everything on the page lives inside this function
export default function App() {
  return (
    // min-h-screen = fill the full browser height
    // bg-gray-900 = dark background
    // text-white = all text defaults to white
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Header bar — flex puts children in a row */}
      {/* justify-between pushes title left and status right */}
      {/* items-center vertically centers both */}
      <header className="flex justify-between items-center p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">sre-bot</h1>
        <span className="text-green-400">● Healthy</span>
      </header>

      {/* Main content area */}
      {/* grid grid-cols-3 = divide into 3 equal columns */}
      {/* gap-4 = spacing between grid items */}
      {/* h-[calc(100vh-64px)] = fill remaining height after header */}
      <main className="grid grid-cols-3 gap-4 p-4 h-[calc(100vh-64px)]">

        {/* Left side takes 2 of 3 columns */}
        {/* flex flex-col = stack children vertically */}
        <div className="col-span-2 flex flex-col gap-4">
          <HealthCard />
          <MetricsFeed />
        </div>

        {/* Right side takes 1 column — chat fills full height */}
        <div className="col-span-1">
          <ChatWindow />
        </div>

      </main>
    </div>
  )
}