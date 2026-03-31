import { useState } from 'react'
import { chat } from '../lib/api'

type Message = { role: string; content: string; created_at: string }

export default function ChatInterface({
  documentId, token, initialMessages,
}: { documentId: string; token: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

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
    <div className="bg-white rounded-xl border flex flex-col h-[480px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-12">Ask a question about this document</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-400 animate-pulse">Thinking…</div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t flex gap-2 p-3">
        <input value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="Ask a question about this document…"
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={loading || !question.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  )
}
