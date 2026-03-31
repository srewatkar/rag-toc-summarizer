import { Link } from 'react-router-dom'

const serif = '"Playfair Display", Georgia, serif'
const sans = '"IBM Plex Sans", system-ui, sans-serif'

const bg = '#0c0c10'
const surface = '#13131a'
const surfaceHover = '#17171f'
const border = 'rgba(255,255,255,0.07)'
const cream = '#f0ebe0'
const muted = '#71717a'
const dim = '#3f3f46'
const amber = '#f5a623'
const amberDim = 'rgba(245,166,35,0.08)'
const amberBorder = 'rgba(245,166,35,0.2)'
const red = '#ef4444'
const redDim = 'rgba(239,68,68,0.07)'
const redBorder = 'rgba(239,68,68,0.15)'
const green = '#4ade80'
const greenDim = 'rgba(74,222,128,0.08)'
const greenBorder = 'rgba(74,222,128,0.2)'

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: amberDim, border: `1px solid ${amberBorder}`,
      borderRadius: '100px', padding: '4px 14px',
      fontSize: '11px', letterSpacing: '0.1em', color: amber,
      textTransform: 'uppercase' as const, fontFamily: sans,
    }}>
      {children}
    </span>
  )
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
        background: amberDim, border: `1px solid ${amberBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: amber, fontFamily: serif, fontSize: '17px', fontWeight: 700,
      }}>
        {n}
      </div>
      <div style={{ paddingTop: '8px' }}>
        <div style={{ color: cream, fontWeight: 600, fontSize: '15px', fontFamily: sans, marginBottom: '8px' }}>{title}</div>
        <div style={{ color: muted, fontSize: '14px', lineHeight: '1.65', fontFamily: sans }}>{desc}</div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      background: surface, border: `1px solid ${border}`,
      borderRadius: '16px', padding: '32px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ fontSize: '26px', marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontFamily: serif, fontSize: '18px', color: cream, fontWeight: 700, marginBottom: '10px' }}>{title}</div>
      <div style={{ color: muted, fontSize: '14px', lineHeight: '1.65', fontFamily: sans }}>{desc}</div>
    </div>
  )
}

function RedFlag({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      padding: '10px 14px', borderRadius: '8px',
      background: redDim, border: `1px solid ${redBorder}`,
      marginBottom: '8px',
    }}>
      <span style={{ color: red, flexShrink: 0, marginTop: '1px', fontSize: '13px' }}>⚑</span>
      <span style={{ color: '#fca5a5', fontSize: '12px', lineHeight: '1.55', fontFamily: sans }}>{text}</span>
    </div>
  )
}

export default function Landing() {
  return (
    <div style={{ background: bg, color: cream, fontFamily: sans, minHeight: '100vh' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: `1px solid ${border}`,
        background: 'rgba(12,12,16,0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '0 clamp(24px, 5vw, 60px)',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: serif, fontSize: '20px', fontWeight: 700, color: cream, letterSpacing: '-0.01em' }}>
          Clause<span style={{ color: amber }}>AI</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" style={{
            color: muted, fontSize: '14px', textDecoration: 'none',
            padding: '8px 18px', borderRadius: '8px', fontFamily: sans,
            transition: 'color 0.2s',
          }}>
            Sign in
          </Link>
          <Link to="/signup" style={{
            background: amber, color: '#0c0c10', fontWeight: 700,
            padding: '8px 20px', borderRadius: '8px',
            textDecoration: 'none', fontSize: '14px', fontFamily: sans,
          }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        maxWidth: '1120px', margin: '0 auto',
        padding: 'clamp(64px, 10vw, 110px) clamp(24px, 5vw, 60px) 80px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center',
      }}>
        {/* Left */}
        <div>
          <div style={{ marginBottom: '28px' }}>
            <Badge>AI-Powered Legal Analysis</Badge>
          </div>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(36px, 5vw, 58px)',
            lineHeight: 1.08, fontWeight: 700, color: cream,
            marginBottom: '24px', letterSpacing: '-0.02em',
          }}>
            Stop signing things<br />you don't understand.
          </h1>
          <p style={{
            color: muted, fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: '1.7', marginBottom: '40px', maxWidth: '440px',
          }}>
            Upload any legal document — terms of service, lease, privacy policy — and get a plain-English summary with red flags highlighted in seconds.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
            <Link to="/signup" style={{
              background: amber, color: '#0c0c10', fontWeight: 700,
              padding: '14px 28px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '15px', fontFamily: sans,
            }}>
              Analyze a document — free
            </Link>
            <Link to="/login" style={{
              border: `1px solid ${border}`, color: muted,
              padding: '14px 28px', borderRadius: '10px',
              textDecoration: 'none', fontSize: '15px', fontFamily: sans,
            }}>
              Sign in
            </Link>
          </div>
          <div style={{ marginTop: '32px', display: 'flex', gap: '8px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
            <span style={{ color: dim, fontSize: '12px', fontFamily: sans, marginRight: '4px' }}>Works with</span>
            {['PDF', 'DOCX', 'URL', 'Plain text'].map(f => (
              <span key={f} style={{
                fontSize: '12px', color: dim,
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: '6px', padding: '3px 10px', fontFamily: sans,
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Right — output mockup */}
        <div style={{
          background: surface, border: `1px solid ${border}`,
          borderRadius: '20px', padding: '28px', fontSize: '13px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Doc header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: amberDim, border: `1px solid ${amberBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0,
            }}>📄</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: cream, fontWeight: 600, fontSize: '13px', fontFamily: sans }}>Terms of Service — Acme Corp</div>
              <div style={{ color: dim, fontSize: '11px', fontFamily: sans, marginTop: '2px' }}>23 pages · analyzed in 4s</div>
            </div>
            <div style={{
              background: greenDim, color: green, border: `1px solid ${greenBorder}`,
              fontSize: '11px', padding: '3px 10px', borderRadius: '100px', fontFamily: sans, flexShrink: 0,
            }}>Ready</div>
          </div>

          {/* Overview */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: dim, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px', fontFamily: sans }}>Overview</div>
            <p style={{ color: '#a1a1aa', lineHeight: '1.65', fontSize: '13px', fontFamily: sans }}>
              Standard SaaS subscription agreement granting Acme broad rights to user data for product improvement. Auto-renews annually unless cancelled 30 days in advance.
            </p>
          </div>

          {/* Red flags */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: dim, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px', fontFamily: sans }}>
              Red Flags <span style={{ color: red }}>3</span>
            </div>
            <RedFlag text="Company may change terms at any time without prior notice" />
            <RedFlag text="User data shared with unnamed third-party partners" />
            <RedFlag text="No refunds issued after the 7-day free trial period" />
          </div>

          {/* Fake chat */}
          <div style={{ borderTop: `1px solid ${border}`, paddingTop: '16px' }}>
            <div style={{ color: dim, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px', fontFamily: sans }}>Ask a question</div>
            <div style={{ background: amberDim, border: `1px solid ${amberBorder}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px', fontFamily: sans }}>Can I cancel my subscription anytime?</span>
            </div>
            <div style={{ background: '#0f0f14', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 14px' }}>
              <span style={{ color: '#a1a1aa', fontSize: '12px', fontFamily: sans }}>Yes, but you must cancel at least 30 days before your renewal date or you will be charged for the next year. No pro-rated refunds are given. <span style={{ color: dim }}>(§ 8.2)</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ borderTop: `1px solid rgba(255,255,255,0.04)` }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '100px clamp(24px, 5vw, 60px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ color: dim, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '16px', fontFamily: sans }}>
              How it works
            </div>
            <h2 style={{
              fontFamily: serif, fontSize: 'clamp(28px, 4vw, 44px)',
              color: cream, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em',
            }}>
              Three steps from fine print<br />to full clarity
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px' }}>
            <Step n="1" title="Upload your document"
              desc="Drop a PDF or DOCX, paste a public URL, or paste text directly. Any legal document works — T&Cs, leases, privacy policies, contracts." />
            <Step n="2" title="AI reads every clause"
              desc="Your document is analyzed by Claude, which generates a structured summary: plain-English overview, key points, and specific red flags." />
            <Step n="3" title="Ask questions, get answers"
              desc="Use the built-in chat to ask anything in plain English. The AI finds the exact paragraphs that answer your question — no guessing." />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: '#0f0f15', borderTop: `1px solid rgba(255,255,255,0.04)`, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '100px clamp(24px, 5vw, 60px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontFamily: serif, fontSize: 'clamp(28px, 4vw, 44px)',
              color: cream, fontWeight: 700, letterSpacing: '-0.02em',
            }}>
              Built to protect you
            </h2>
            <p style={{ color: muted, fontSize: '16px', marginTop: '14px', fontFamily: sans }}>
              Everything you need before you click "I agree"
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <FeatureCard icon="⚑"
              title="Red flags, front and centre"
              desc="Auto-renewals, data sharing, arbitration waivers, unilateral change rights — the AI flags exactly what could hurt you, in plain English." />
            <FeatureCard icon="💬"
              title="Ask anything, get cited answers"
              desc="'Can I cancel anytime?' 'Who owns my data?' Get direct answers with the exact clause reference so you can verify it yourself." />
            <FeatureCard icon="📄"
              title="Any format, any source"
              desc="PDF, DOCX, a public URL, or plain pasted text. If you can read it, ClauseAI can analyze it." />
            <FeatureCard icon="🔒"
              title="Private by design"
              desc="Documents are locked to your account with row-level security. Nobody else can ever see your uploads or analysis." />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '120px clamp(24px, 5vw, 60px)', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(32px, 5vw, 54px)',
          color: cream, fontWeight: 700,
          lineHeight: 1.1, letterSpacing: '-0.02em',
          marginBottom: '20px',
        }}>
          Read the fine print.<br />
          <span style={{ color: amber }}>We'll find the red flags.</span>
        </h2>
        <p style={{ color: muted, fontSize: '16px', marginBottom: '44px', lineHeight: '1.65', fontFamily: sans }}>
          Free to use · 5 documents per day · No credit card required
        </p>
        <Link to="/signup" style={{
          display: 'inline-block',
          background: amber, color: '#0c0c10', fontWeight: 700,
          padding: '16px 44px', borderRadius: '12px',
          textDecoration: 'none', fontSize: '16px', fontFamily: sans,
          boxShadow: `0 0 40px rgba(245,166,35,0.2)`,
        }}>
          Get started for free
        </Link>
        <div style={{ marginTop: '24px' }}>
          <Link to="/login" style={{ color: dim, fontSize: '14px', textDecoration: 'none', fontFamily: sans }}>
            Already have an account? <span style={{ color: muted, textDecoration: 'underline' }}>Sign in</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid rgba(255,255,255,0.04)`, padding: '32px clamp(24px, 5vw, 60px)', textAlign: 'center' }}>
        <span style={{ color: dim, fontSize: '13px', fontFamily: sans }}>
          Built with FastAPI · React · Supabase · Claude
        </span>
      </footer>
    </div>
  )
}
