import { Link } from 'react-router-dom'

// All colours match Login/Signup exactly:
// bg-gray-50 page, bg-white cards, indigo-600 actions, gray text scale

const outfitHeading = { fontFamily: "'Outfit', system-ui, sans-serif" }

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide px-3 py-1 rounded-full">
      {children}
    </span>
  )
}

function RedFlagRow({ text }: { text: string }) {
  return (
    <div className="flex gap-2 items-start bg-red-50 rounded-lg px-3 py-2 mb-1.5">
      <span className="text-red-500 text-xs mt-0.5 flex-shrink-0">⚑</span>
      <span className="text-red-700 text-xs leading-relaxed">{text}</span>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── same white card feel as the rest of the app */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900" style={outfitHeading}>
            Clause<span className="text-indigo-600">AI</span>
          </span>
          <div className="flex items-center gap-2">
            <Link to="/login"
              className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Sign in
            </Link>
            <Link to="/signup"
              className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            <div className="mb-5">
              <SectionLabel>✦ AI-Powered Legal Analysis</SectionLabel>
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-5" style={outfitHeading}>
              Stop signing things<br />
              you don't{' '}
              <span className="text-indigo-600">understand.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Upload any legal document — terms of service, lease, privacy policy — and get a plain-English summary with red flags highlighted in seconds.
            </p>
            <div className="flex gap-3 flex-wrap mb-6">
              <Link to="/signup"
                className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                Analyze a document — free
              </Link>
              <Link to="/login"
                className="bg-white text-gray-700 font-semibold px-6 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
                Sign in
              </Link>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-xs text-gray-400">Works with</span>
              {['PDF', 'DOCX', 'URL', 'Plain text'].map(f => (
                <span key={f} className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right — output mockup, same card style as Login */}
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
            <div className="h-1 bg-indigo-600" />
            <div className="p-6">
              {/* Doc header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">Terms of Service — Acme Corp</div>
                  <div className="text-xs text-gray-400">23 pages · analyzed in 4s</div>
                </div>
                <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full flex-shrink-0">
                  Ready
                </span>
              </div>

              {/* Overview */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Overview</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Standard SaaS agreement. Acme gets broad data rights for product improvement. Auto-renews annually unless cancelled 30 days prior.
                </p>
              </div>

              {/* Red flags */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Red Flags</div>
                  <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">3</span>
                </div>
                <RedFlagRow text="Terms may change at any time without notice" />
                <RedFlagRow text="Data shared with unnamed third-party partners" />
                <RedFlagRow text="No refunds after the 7-day trial period" />
              </div>

              {/* Chat sample */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ask a question</div>
                <div className="bg-indigo-50 rounded-lg px-3 py-2 mb-2">
                  <span className="text-indigo-700 text-xs font-medium">Can I cancel anytime?</span>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600 text-xs leading-relaxed">
                    Yes, but you must cancel 30 days before renewal or you'll be charged for the next year. No refunds.{' '}
                    <span className="text-indigo-600 font-semibold">§ 8.2</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="mb-4"><SectionLabel>How it works</SectionLabel></div>
            <h2 className="text-3xl font-extrabold text-gray-900" style={outfitHeading}>
              Three steps to clarity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: '1', title: 'Upload your document', desc: 'Drop a PDF or DOCX, paste a public URL, or paste text directly. Any legal document works.' },
              { n: '2', title: 'AI reads every clause', desc: 'Claude produces a structured summary: plain-English overview, key points, and specific red flags.' },
              { n: '3', title: 'Ask in plain English', desc: 'Chat with the document. Get direct answers with the exact clause cited so you can verify it yourself.' },
            ].map(s => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-lg font-extrabold mx-auto mb-4"
                  style={outfitHeading}>
                  {s.n}
                </div>
                <div className="font-semibold text-gray-800 mb-2">{s.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900" style={outfitHeading}>
            Built to protect you
          </h2>
          <p className="text-gray-500 mt-3 text-sm">Everything you need before clicking "I agree"</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '⚑', bg: 'bg-red-50',    title: 'Red flags, front and centre',     desc: 'Auto-renewals, data sharing, arbitration waivers — the AI flags exactly what could hurt you, in plain English.' },
            { icon: '💬', bg: 'bg-indigo-50', title: 'Ask anything, get cited answers', desc: "'Can I cancel anytime?' 'Who owns my data?' Get direct answers with the exact clause reference." },
            { icon: '📄', bg: 'bg-sky-50',    title: 'Any format, any source',          desc: 'PDF, DOCX, a public URL, or plain pasted text. If you can read it, ClauseAI can analyze it.' },
            { icon: '🔒', bg: 'bg-green-50',  title: 'Private by design',               desc: 'Documents are locked to your account with row-level security. No one else can ever see your uploads.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4 items-start">
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{f.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── indigo-600 block, same colour as all the app's primary buttons */}
      <section className="bg-indigo-600">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3" style={outfitHeading}>
            Read the fine print.<br />We'll find the red flags.
          </h2>
          <p className="text-indigo-200 text-sm mb-8">Free · 5 documents per day · No credit card required</p>
          <Link to="/signup"
            className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
            Get started for free
          </Link>
          <div className="mt-5">
            <Link to="/login" className="text-indigo-300 hover:text-white text-sm transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center">
        <span className="text-xs text-gray-400">Built with FastAPI · React · Supabase · Claude</span>
      </footer>
    </div>
  )
}
