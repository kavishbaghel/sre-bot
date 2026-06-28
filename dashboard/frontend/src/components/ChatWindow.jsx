import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  // useRef creates a reference to a DOM element
  // We use it to auto-scroll to the bottom when new messages appear
  const messagesEndRef = useRef(null)

  // Scroll to bottom whenever messages change
  // This dependency array [messages] means "run this effect when messages updates"
  useEffect(() => {
    // scrollIntoView smoothly scrolls the referenced element into view
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/chat', { message: userMessage })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process your request. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-full">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-400" />
        <h2 className="text-sm font-semibold">Chat with sre-bot</h2>
        <span className="text-xs text-gray-500 ml-auto">Powered by llama3.2</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
              <span className="text-blue-400 text-lg">⚡</span>
            </div>
            <p className="text-gray-300 text-sm font-medium">How can I help you?</p>
            <p className="text-gray-500 text-xs mt-1 max-w-sm">
              Ask about system health, recent incidents, failure patterns, or troubleshooting steps
            </p>

            {/* Suggested prompts — clicking one sends it as a message */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                'Is the system healthy?',
                'What errors are happening?',
                'Show me failure trends',
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt)
                    // setTimeout ensures the input state updates before sending
                    // 0ms timeout pushes sendMessage to the next event loop tick
                    setTimeout(() => {
                      setMessages(prev => [...prev, { role: 'user', content: prompt }])
                      setLoading(true)
                      axios.post('/api/chat', { message: prompt })
                        .then(res => setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]))
                        .catch(() => setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response.' }]))
                        .finally(() => setLoading(false))
                      setInput('')
                    }, 0)
                  }}
                  className="text-xs text-gray-400 border border-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 border border-gray-700 rounded-xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1.5">
                {/* Three bouncing dots animation */}
                {/* Each dot has a different animation-delay to create a wave effect */}
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Invisible element at the bottom — scrollIntoView targets this */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your infrastructure..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-4 py-2.5 border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white text-sm rounded-lg px-5 py-2.5 font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}