import { useState } from 'react'
import { Link } from 'react-router-dom'

function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Opens the user's mail client pre-filled — no backend needed
    const subject = encodeURIComponent('ClauseAI — Contact')
    const body = encodeURIComponent(`From: ${email}\n\n${message}`)
    window.location.href = `mailto:hello@clauseai.app?subject=${subject}&body=${body}`
    setSent(true)
  }

  return sent ? (
    <div role="status" className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <p className="text-green-700 font-semibold text-sm mb-1">Message ready to send!</p>
      <p className="text-green-600 text-sm">Your mail client should have opened. If not, email us directly at <a href="mailto:hello@clauseai.app" className="underline">hello@clauseai.app</a>.</p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Your email</label>
        <input
          id="contact-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          id="contact-message"
          required
          placeholder="What can we help you with?"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Send message
      </button>
    </form>
  )
}

const outfitHeading = { fontFamily: "'Outfit', system-ui, sans-serif" }

const FAQS = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'What is ClauseAI?',
        a: 'ClauseAI is an AI-powered legal document analyzer. Upload any legal document — terms of service, privacy policy, lease, NDA, employment contract — and get a plain-English summary with key points, red flags, and things to watch out for. You can also ask questions about the document in natural language.',
      },
      {
        q: 'Do I need an account to use ClauseAI?',
        a: 'Yes, a free account is required. Sign up with just your email address — no credit card needed.',
      },
      {
        q: 'What types of documents can I analyze?',
        a: 'Any text-based legal document works well: terms of service, privacy policies, lease agreements, employment contracts, NDAs, end-user license agreements (EULAs), and more. You can upload a PDF or DOCX file, paste a public URL, or paste the text directly.',
      },
    ],
  },
  {
    section: 'Usage & Limits',
    items: [
      {
        q: 'How many documents can I analyze?',
        a: 'Free accounts can analyze up to 5 documents per day. The limit resets at midnight UTC.',
      },
      {
        q: 'Is there a file size limit?',
        a: 'Uploaded files (PDF or DOCX) must be under 10 MB. There is no size limit when pasting plain text.',
      },
      {
        q: 'How many questions can I ask about a document?',
        a: 'There is no limit on chat questions per document. Ask as many as you need.',
      },
      {
        q: 'What file formats are supported?',
        a: 'PDF and DOCX uploads are supported. You can also provide any publicly accessible URL or paste plain text directly.',
      },
    ],
  },
  {
    section: 'Privacy & Security',
    items: [
      {
        q: 'Is my document data safe?',
        a: 'Your documents are stored securely in Supabase with row-level security — only your account can access your documents. We never share your documents with third parties.',
      },
      {
        q: 'Can ClauseAI see my documents?',
        a: 'Document content is sent to Claude (Anthropic\'s AI) to generate summaries and answer questions. Anthropic\'s privacy policy governs that processing. We do not use your documents to train any models.',
      },
      {
        q: 'How do I delete my data?',
        a: 'You can delete individual documents from your dashboard, or delete your entire account from the Profile page. Account deletion permanently removes all your documents, summaries, and chat history.',
      },
    ],
  },
  {
    section: 'Accuracy & Limitations',
    items: [
      {
        q: 'How accurate is the AI analysis?',
        a: 'ClauseAI uses Claude by Anthropic, one of the most capable AI models available. It performs well at identifying common legal clauses and red flags. However, accuracy can vary depending on document complexity and formatting.',
      },
      {
        q: 'Can I rely on ClauseAI for legal decisions?',
        a: 'No. ClauseAI is a tool to help you understand documents faster — it is not a substitute for professional legal advice. Always consult a qualified lawyer before signing anything with significant legal or financial consequences.',
      },
      {
        q: 'Why might the summary miss something important?',
        a: 'The AI analyzes a representative sample of the document. Very long documents may have clauses in sections that were not included in the analysis window. When in doubt, read the full document or consult a lawyer.',
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900" style={outfitHeading}>
            Clause<span className="text-indigo-600">AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-sm text-indigo-600 font-semibold mb-2">Support</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={outfitHeading}>
            Frequently Asked Questions
          </h1>
          <p className="text-gray-500">Everything you need to know about ClauseAI.</p>
        </div>

        <div className="space-y-8">
          {FAQS.map(({ section, items }) => (
            <div key={section} className="bg-white rounded-xl border px-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-5 pb-2">{section}</h2>
              {items.map(item => (
                <FAQItem key={item.q} {...item} />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white border border-gray-200 rounded-xl p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1" style={outfitHeading}>Still have questions?</h2>
          <p className="text-sm text-gray-500 mb-6">Send us a message and we'll get back to you.</p>
          <ContactForm />
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ClauseAI · <Link to="/" className="hover:text-indigo-600">Home</Link> · <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
      </footer>
    </div>
  )
}
