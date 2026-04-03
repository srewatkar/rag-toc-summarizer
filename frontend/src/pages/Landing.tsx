import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── same white card feel as the rest of the app */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900" style={outfitHeading}>
            Clause<span className="text-indigo-600">AI</span>
          </span>
          <div className="flex items-center gap-2">
            {loggedIn ? (
              <Link to="/dashboard"
                className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign in
                </Link>
                <Link to="/signup"
                  className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Get started
                </Link>
              </>
            )}
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
              {loggedIn ? (
                <Link to="/dashboard"
                  className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/signup"
                  className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Analyze a document — free
                </Link>
              )}
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
      <section id="how-it-works" className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="mb-4"><SectionLabel>How it works</SectionLabel></div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3" style={outfitHeading}>
              From upload to insight in seconds
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">No legal training required. ClauseAI does the reading so you can focus on the decisions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                n: '1',
                title: 'Upload your document',
                desc: 'Drop a PDF or DOCX file, paste a publicly accessible URL, or paste the text directly. Works with terms of service, leases, NDAs, employment contracts, privacy policies, and more.',
              },
              {
                n: '2',
                title: 'AI reads every clause',
                desc: 'Claude — one of the most capable AI models available — reads the full document and produces a structured breakdown: plain-English overview, key obligations, red flags, and things to watch out for.',
              },
              {
                n: '3',
                title: 'Ask in plain English',
                desc: "Chat with the document in your own words. Ask things like 'Can I cancel anytime?' or 'Who owns the content I create?' and get a direct answer with the relevant clause identified.",
              },
            ].map(s => (
              <div key={s.n} className="relative pl-16">
                <div className="absolute left-0 top-0 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0" style={outfitHeading}>
                  {s.n}
                </div>
                <div className="font-semibold text-gray-900 mb-2">{s.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
          {/* Supported formats strip */}
          <div className="bg-gray-50 rounded-xl p-5 flex flex-wrap items-center gap-3 justify-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-2">Supported inputs</span>
            {['PDF', 'DOCX', 'Public URL', 'Pasted text'].map(f => (
              <span key={f} className="bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="mb-4"><SectionLabel>Features</SectionLabel></div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3" style={outfitHeading}>
            Everything you need before clicking "I agree"
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">Built for people who don't have time to read 40 pages of legalese.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            {
              icon: '🚩',
              bg: 'bg-red-50',
              title: 'Red flags, front and centre',
              desc: 'Auto-renewals, mandatory arbitration, data sharing with third parties, unilateral change clauses — the AI surfaces exactly what could hurt you before you sign.',
            },
            {
              icon: '💬',
              bg: 'bg-indigo-50',
              title: 'Ask anything, get direct answers',
              desc: "Chat with your document in plain English. 'Can I cancel anytime?', 'Who owns my data?', 'What happens if I miss a payment?' Get clear answers grounded in the actual text.",
            },
            {
              icon: '📋',
              bg: 'bg-sky-50',
              title: 'Structured summary',
              desc: 'Every analysis returns a plain-English overview, a list of key obligations, red flags, and additional things to watch out for — all collapsible and easy to scan.',
            },
            {
              icon: '📄',
              bg: 'bg-violet-50',
              title: 'Any format, any source',
              desc: 'Upload a PDF or DOCX, paste a public URL to any web page, or paste the text directly. If you can read it, ClauseAI can analyze it.',
            },
            {
              icon: '🔒',
              bg: 'bg-green-50',
              title: 'Private by design',
              desc: 'Your documents are locked to your account with row-level security. No other user — or ClauseAI staff — can ever access your uploads.',
            },
            {
              icon: '⚡',
              bg: 'bg-amber-50',
              title: 'Results in seconds',
              desc: 'Analysis runs in the background the moment you upload. Most documents are ready in under 30 seconds. Come back anytime — your summaries are saved.',
            },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4 items-start">
              <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`} aria-hidden="true">
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
          {loggedIn ? (
            <Link to="/dashboard"
              className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/signup"
                className="inline-block bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg hover:bg-indigo-50 transition-colors text-sm">
                Get started for free
              </Link>
              <div className="mt-5">
                <Link to="/login" className="text-indigo-300 hover:text-white text-sm transition-colors">
                  Already have an account? Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-lg font-bold text-gray-900" style={outfitHeading}>
                Clause<span className="text-indigo-600">AI</span>
              </span>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                AI-powered legal document analysis. Free to use, no card required.
              </p>
              <p className="text-xs text-gray-400 mt-3">Built with FastAPI · React · Supabase · Claude</p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/signup" className="hover:text-indigo-600 transition-colors">Create free account</Link></li>
                <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Sign in</Link></li>
                <li><Link to="/faq" className="hover:text-indigo-600 transition-colors">FAQ</Link></li>
                <li><Link to="/sitemap" className="hover:text-indigo-600 transition-colors">Sitemap</Link></li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Learn</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a></li>
                <li><a href="#features" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><Link to="/faq#faq-accurate" className="hover:text-indigo-600 transition-colors">Accuracy & limitations</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="mailto:hello@clauseai.app" className="hover:text-indigo-600 transition-colors">hello@clauseai.app</a></li>
                <li><Link to="/faq" className="hover:text-indigo-600 transition-colors">Help & FAQ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} ClauseAI. All rights reserved.</span>
            <span>Not a substitute for professional legal advice.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
