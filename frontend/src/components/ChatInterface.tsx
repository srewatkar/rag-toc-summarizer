import { useEffect, useRef, useState } from 'react'
import { chat } from '../lib/api'

type Message = { role: string; content: string; created_at: string }

export default function ChatInterface({
  documentId, token, initialMessages,
}: { documentId: string; token: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    if (isInitialMount.current) {
      // On load: jump to bottom of chat box without affecting page scroll
      el.scrollTop = el.scrollHeight
      isInitialMount.current = false
      return
    }
    // After user sends a message: smooth scroll within the chat box only
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim()) return
    const q = question
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: q, created_at: new Date().toISOString() }])
    setLoading(true)
    const { answer } = await chat(documentId, q, token)
    setMessages(prev => [...prev, { role: 'assistant', content: answer, created_at: new Date().toISOString() }])
    setLoading(false)
  }

  return (
    <section aria-label="Document chat" className="bg-white rounded-xl border flex flex-col h-72 sm:h-96 md:h-[480px]">
      {/* Message list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center mt-12 text-sm">Ask a question about this document</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
              aria-label={msg.role === 'user' ? 'You' : 'Assistant'}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start" aria-label="Assistant is thinking">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-500 animate-pulse">Thinking…</div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t flex gap-2 p-3">
        <label htmlFor="chat-input" className="sr-only">Ask a question about this document</label>
        <input
          id="chat-input"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a question about this document…"
          className="flex-1 border rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          aria-busy={loading}
          className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 min-h-[44px] min-w-[64px]"
        >
          Send
        </button>
      </form>
    </section>
  )
}
