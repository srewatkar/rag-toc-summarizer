import { Link } from 'react-router-dom'

const font = '"Outfit", system-ui, sans-serif'

// Palette
const violet = '#7c3aed'
const violetLight = '#ede9fe'
const violetSoft = 'rgba(124,58,237,0.08)'
const sky = '#0ea5e9'
const skyLight = '#e0f2fe'
const emerald = '#10b981'
const emeraldLight = '#d1fae5'
const rose = '#f43f5e'
const roseLight = '#ffe4e6'
const amber = '#f59e0b'
const amberLight = '#fef3c7'
const textDark = '#1e1b4b'
const textMid = '#475569'
const textMuted = '#94a3b8'
const bgPage = '#f7f8ff'
const white = '#ffffff'
const borderColor = 'rgba(124,58,237,0.1)'

const cardShadow = '0 4px 24px rgba(124,58,237,0.07), 0 1px 4px rgba(0,0,0,0.04)'
const heroShadow = '0 24px 64px rgba(124,58,237,0.12), 0 4px 20px rgba(0,0,0,0.06)'

// Background blobs via radial gradients
const pageBg = `
  radial-gradient(ellipse 70% 55% at -5% -5%, rgba(124,58,237,0.11) 0%, transparent 60%),
  radial-gradient(ellipse 55% 45% at 105% 0%, rgba(14,165,233,0.09) 0%, transparent 55%),
  radial-gradient(ellipse 65% 50% at 50% 115%, rgba(16,185,129,0.07) 0%, transparent 60%),
  ${bgPage}
`.replace(/\s+/g, ' ').trim()

function Pill({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      background: bg, color, fontFamily: font,
      borderRadius: '100px', padding: '4px 14px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  )
}

function Step({ n, color, bg, title, desc }: { n: string; color: string; bg: string; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 12px' }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: bg, color, fontFamily: font,
        fontSize: '20px', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        {n}
      </div>
      <div style={{ fontFamily: font, fontSize: '16px', fontWeight: 700, color: textDark, marginBottom: '10px' }}>{title}</div>
      <div style={{ fontFamily: font, fontSize: '14px', color: textMid, lineHeight: '1.65' }}>{desc}</div>
    </div>
  )
}

function FeatureCard({ icon, iconBg, iconColor, title, desc }: {
  icon: string; iconBg: string; iconColor: string; title: string; desc: string
}) {
  return (
    <div style={{
      background: white, borderRadius: '20px', padding: '28px',
      border: `1px solid ${borderColor}`, boxShadow: cardShadow,
      display: 'flex', flexDirection: 'column' as const, gap: '14px',
    }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: iconBg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: font, fontSize: '17px', fontWeight: 700, color: textDark }}>{title}</div>
      <div style={{ fontFamily: font, fontSize: '14px', color: textMid, lineHeight: '1.65' }}>{desc}</div>
    </div>
  )
}

function RedFlagRow({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      padding: '9px 12px', borderRadius: '10px',
      background: roseLight, marginBottom: '6px',
    }}>
      <span style={{ color: rose, flexShrink: 0, fontSize: '12px', marginTop: '2px' }}>⚑</span>
      <span style={{ fontFamily: font, fontSize: '12px', color: '#9f1239', lineHeight: '1.5' }}>{text}</span>
    </div>
  )
}

export default function Landing() {
  return (
    <div style={{ background: pageBg, minHeight: '100vh', fontFamily: font }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(247,248,255,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${borderColor}`,
        padding: '0 clamp(20px, 5vw, 60px)',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: font, fontSize: '20px', fontWeight: 800, color: textDark, letterSpacing: '-0.02em' }}>
          Clause<span style={{ color: violet }}>AI</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" style={{
            color: textMid, fontSize: '14px', fontWeight: 500, textDecoration: 'none',
            padding: '8px 16px', borderRadius: '10px', fontFamily: font,
          }}>
            Sign in
          </Link>
          <Link to="/signup" style={{
            background: violet, color: white, fontWeight: 700,
            padding: '9px 22px', borderRadius: '10px',
            textDecoration: 'none', fontSize: '14px', fontFamily: font,
            boxShadow: `0 2px 12px rgba(124,58,237,0.3)`,
          }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        maxWidth: '1140px', margin: '0 auto',
        padding: 'clamp(60px, 10vw, 110px) clamp(20px, 5vw, 60px) 80px',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
        gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center',
      }}>
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Pill color={violet} bg={violetLight}>✦ AI-Powered Legal Analysis</Pill>
          </div>
          <h1 style={{
            fontFamily: font, fontSize: 'clamp(38px, 5.5vw, 62px)',
            fontWeight: 800, color: textDark, lineHeight: 1.05,
            letterSpacing: '-0.03em', marginBottom: '22px',
          }}>
            Stop signing things<br />
            you don't<br />
            <span style={{
              background: `linear-gradient(135deg, ${violet} 0%, ${sky} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>understand.</span>
          </h1>
          <p style={{
            color: textMid, fontSize: 'clamp(15px, 2vw, 17px)',
            lineHeight: '1.7', marginBottom: '36px', maxWidth: '420px', fontFamily: font,
          }}>
            Upload any legal document — terms of service, lease, privacy policy — and get a plain-English summary with red flags highlighted in seconds.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const, marginBottom: '32px' }}>
            <Link to="/signup" style={{
              background: `linear-gradient(135deg, ${violet} 0%, #6d28d9 100%)`,
              color: white, fontWeight: 700, fontFamily: font,
              padding: '14px 28px', borderRadius: '12px',
              textDecoration: 'none', fontSize: '15px',
              boxShadow: `0 4px 20px rgba(124,58,237,0.35)`,
            }}>
              Analyze a document — free
            </Link>
            <Link to="/login" style={{
              color: violet, fontWeight: 600, fontFamily: font,
              padding: '14px 24px', borderRadius: '12px',
              textDecoration: 'none', fontSize: '15px',
              border: `1.5px solid ${violetLight}`,
              background: white,
            }}>
              Sign in
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
            <span style={{ color: textMuted, fontSize: '12px', fontFamily: font, marginRight: '4px' }}>Works with</span>
            {['PDF', 'DOCX', 'URL', 'Plain text'].map(f => (
              <span key={f} style={{
                fontSize: '12px', color: textMid, fontFamily: font, fontWeight: 500,
                background: white, border: `1px solid ${borderColor}`,
                borderRadius: '8px', padding: '3px 11px',
              }}>{f}</span>
            ))}
          </div>
        </div>

        {/* ── Output Mockup Card ── */}
        <div style={{
          background: white, borderRadius: '24px',
          border: `1px solid ${borderColor}`, boxShadow: heroShadow,
          overflow: 'hidden',
        }}>
          {/* Gradient top strip */}
          <div style={{
            height: '4px',
            background: `linear-gradient(90deg, ${violet} 0%, ${sky} 50%, ${emerald} 100%)`,
          }} />
          <div style={{ padding: '24px' }}>
            {/* Doc header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                background: violetSoft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
              }}>📄</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: font, fontWeight: 700, fontSize: '13px', color: textDark }}>
                  Terms of Service — Acme Corp
                </div>
                <div style={{ fontFamily: font, fontSize: '11px', color: textMuted, marginTop: '2px' }}>
                  23 pages · analyzed in 4s
                </div>
              </div>
              <div style={{
                background: emeraldLight, color: emerald, fontFamily: font,
                fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                borderRadius: '100px', flexShrink: 0,
              }}>Ready</div>
            </div>

            {/* Overview */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontFamily: font, fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>
                Overview
              </div>
              <p style={{ fontFamily: font, fontSize: '13px', color: textMid, lineHeight: '1.65' }}>
                Standard SaaS subscription agreement. Grants Acme broad rights to user data for product improvement. Auto-renews annually unless cancelled 30 days prior.
              </p>
            </div>

            {/* Red flags */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ fontFamily: font, fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>Red Flags</div>
                <div style={{ background: roseLight, color: rose, fontFamily: font, fontSize: '11px', fontWeight: 700, padding: '1px 8px', borderRadius: '100px' }}>3</div>
              </div>
              <RedFlagRow text="Company may change terms at any time without prior notice" />
              <RedFlagRow text="User data shared with unnamed third-party partners" />
              <RedFlagRow text="No refunds after the 7-day free trial period" />
            </div>

            {/* Chat sample */}
            <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
              <div style={{ fontFamily: font, fontSize: '10px', fontWeight: 700, color: textMuted, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>
                Ask a question
              </div>
              <div style={{ background: violetSoft, borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' }}>
                <span style={{ fontFamily: font, fontSize: '12px', color: violet, fontWeight: 500 }}>Can I cancel my subscription anytime?</span>
              </div>
              <div style={{ background: bgPage, border: `1px solid ${borderColor}`, borderRadius: '10px', padding: '10px 14px' }}>
                <span style={{ fontFamily: font, fontSize: '12px', color: textMid, lineHeight: '1.55' }}>
                  Yes, but you must cancel at least 30 days before renewal or you'll be charged for the next year. No refunds. <span style={{ color: violet, fontWeight: 600 }}>§ 8.2</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '80px clamp(20px, 5vw, 60px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ marginBottom: '14px' }}>
            <Pill color={sky} bg={skyLight}>How it works</Pill>
          </div>
          <h2 style={{
            fontFamily: font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
            color: textDark, letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            Three steps to clarity
          </h2>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px', position: 'relative',
        }}>
          <Step n="1" color={violet} bg={violetLight}
            title="Upload your document"
            desc="Drop a PDF or DOCX, paste a public URL, or paste text directly. Any legal document works." />
          <Step n="2" color={sky} bg={skyLight}
            title="AI reads every clause"
            desc="Claude analyzes your document and produces a structured summary: overview, key points, and red flags." />
          <Step n="3" color={emerald} bg={emeraldLight}
            title="Ask in plain English"
            desc="Chat with the document. The AI finds the exact paragraph that answers your question and cites it." />
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{
        background: 'rgba(124,58,237,0.03)', borderTop: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '100px clamp(20px, 5vw, 60px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ marginBottom: '14px' }}>
              <Pill color={emerald} bg={emeraldLight}>Features</Pill>
            </div>
            <h2 style={{
              fontFamily: font, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
              color: textDark, letterSpacing: '-0.03em',
            }}>
              Built to protect you
            </h2>
            <p style={{ color: textMid, fontSize: '16px', marginTop: '14px', fontFamily: font }}>
              Everything you need before clicking "I agree"
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <FeatureCard icon="⚑" iconBg={roseLight} iconColor={rose}
              title="Red flags, front and centre"
              desc="Auto-renewals, data sharing, arbitration waivers, unilateral changes — the AI flags what could hurt you before you sign." />
            <FeatureCard icon="💬" iconBg={violetLight} iconColor={violet}
              title="Ask anything, get cited answers"
              desc="'Can I cancel anytime?' 'Who owns my data?' Get direct answers with the exact clause reference." />
            <FeatureCard icon="📄" iconBg={skyLight} iconColor={sky}
              title="Any format, any source"
              desc="PDF, DOCX, a public URL, or plain pasted text. If you can read it, ClauseAI can analyze it." />
            <FeatureCard icon="🔒" iconBg={emeraldLight} iconColor={emerald}
              title="Private by design"
              desc="Documents are locked to your account with row-level security. No one else can ever see your uploads or analysis." />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '120px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>
          <Pill color={amber} bg={amberLight}>✦ Free · No credit card needed</Pill>
        </div>
        <h2 style={{
          fontFamily: font, fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 800,
          color: textDark, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px',
        }}>
          Read the fine print.<br />
          <span style={{
            background: `linear-gradient(135deg, ${violet} 0%, ${sky} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            We'll find the red flags.
          </span>
        </h2>
        <p style={{ color: textMid, fontSize: '16px', marginBottom: '44px', lineHeight: '1.65', fontFamily: font }}>
          5 documents per day · Works with PDF, DOCX, URLs & plain text
        </p>
        <Link to="/signup" style={{
          display: 'inline-block',
          background: `linear-gradient(135deg, ${violet} 0%, #6d28d9 100%)`,
          color: white, fontWeight: 700, fontFamily: font,
          padding: '16px 48px', borderRadius: '14px',
          textDecoration: 'none', fontSize: '16px',
          boxShadow: `0 6px 28px rgba(124,58,237,0.35)`,
        }}>
          Get started for free
        </Link>
        <div style={{ marginTop: '24px' }}>
          <Link to="/login" style={{ color: textMuted, fontSize: '14px', textDecoration: 'none', fontFamily: font }}>
            Already have an account?{' '}
            <span style={{ color: violet, fontWeight: 600, textDecoration: 'underline' }}>Sign in</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${borderColor}`, padding: '28px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <span style={{ color: textMuted, fontSize: '13px', fontFamily: font }}>
          Built with FastAPI · React · Supabase · Claude
        </span>
      </footer>
    </div>
  )
}
