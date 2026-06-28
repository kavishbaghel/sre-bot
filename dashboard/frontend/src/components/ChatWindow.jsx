import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send, Bot, User, Zap } from 'lucide-react'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
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
        content: 'Unable to reach sre-bot agent. Please check that Ollama is running.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Is the system healthy?',
    'What errors are happening?',
    'Analyze recent failures',
    'Suggest remediation steps',
  ]

  return (
    <div className="bg-gray-900/80 border border-gray-800/50 rounded-xl flex flex-col h-full backdrop-blur-sm">
      {/* Chat header */}
      <div className="px-5 py-3.5 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">sre-bot assistant</h2>
            <p className="text-[10px] text-gray-500">AI-powered infrastructure analysis</p>
          </div>
        </div>
        <span className="text-[10px] text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded font-mono">llama3.2:3b</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Welcome state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-gray-200 text-sm font-medium">How can I help?</p>
            <p className="text-gray-500 text-xs mt-1.5 max-w-xs leading-relaxed">
              Ask about system health, investigate incidents, analyze failure patterns, or get remediation guidance
            </p>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mt-5 justify-center max-w-md">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMessages(prev => [...prev, { role: 'user', content: prompt }])
                    setLoading(true)
                    axios.post('/api/chat', { message: prompt })
                      .then(res => setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]))
                      .catch(() => setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response.' }]))
                      .finally(() => setLoading(false))
                  }}
                  className="text-[11px] text-gray-400 border border-gray-800 rounded-lg px-3 py-1.5 hover:bg-gray-800/70 hover:text-gray-200 hover:border-gray-700 transition-all"
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
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'user'
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-gray-700/50 border border-gray-600/30'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3 h-3 text-blue-400" />
                : <Bot className="w-3 h-3 text-gray-400" />
              }
            </div>

            {/* Message bubble */}
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-gray-800/80 text-gray-200 border border-gray-700/50 rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gray-700/50 border border-gray-600/30 flex items-center justify-center">
              <Bot className="w-3 h-3 text-gray-400" />
            </div>
            <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-gray-500 ml-2">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your infrastructure..."
            className="flex-1 bg-gray-800/50 text-white text-sm rounded-xl px-4 py-2.5 border border-gray-700/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 placeholder-gray-600"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}