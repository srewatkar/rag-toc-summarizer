import { Link } from 'react-router-dom'

const outfitHeading = { fontFamily: "'Outfit', system-ui, sans-serif" }

const SECTIONS = [
  {
    title: 'Public Pages',
    links: [
      { label: 'Home', path: '/', desc: 'Landing page — overview, how it works, features' },
      { label: 'FAQ', path: '/faq', desc: 'Frequently asked questions and contact form' },
      { label: 'Sitemap', path: '/sitemap', desc: 'This page' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign up', path: '/signup', desc: 'Create a free account' },
      { label: 'Sign in', path: '/login', desc: 'Log in to your account' },
      { label: 'Forgot password', path: '/forgot-password', desc: 'Reset your password via email' },
    ],
  },
  {
    title: 'App (requires sign in)',
    links: [
      { label: 'Dashboard', path: '/dashboard', desc: 'View and manage your analyzed documents' },
      { label: 'Analyze Document', path: '/upload', desc: 'Upload a file, URL, or paste text to analyze' },
      { label: 'Profile', path: '/profile', desc: 'Update your name, password, or delete your account' },
    ],
  },
]

export default function Sitemap() {
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
          <p className="text-sm text-indigo-600 font-semibold mb-2">Navigation</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3" style={outfitHeading}>Sitemap</h1>
          <p className="text-gray-500 text-sm">All pages available on ClauseAI.</p>
        </div>

        <div className="space-y-6">
          {SECTIONS.map(({ title, links }) => (
            <div key={title} className="bg-white rounded-xl border overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 border-b">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {links.map(({ label, path, desc }) => (
                  <li key={path}>
                    <Link
                      to={path}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </div>
                      <span className="text-xs text-gray-300 font-mono group-hover:text-indigo-400 transition-colors">{path}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          Looking for the XML sitemap for search engines?{' '}
          <a href="/sitemap.xml" className="text-indigo-500 hover:underline" target="_blank" rel="noopener noreferrer">
            sitemap.xml
          </a>
        </p>
      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ClauseAI · <Link to="/" className="hover:text-indigo-600">Home</Link> · <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
      </footer>
    </div>
  )
}
