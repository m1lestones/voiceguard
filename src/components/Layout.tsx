import { Link, useLocation } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const isHome = loc.pathname === '/'
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)',
        }}
      >
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700, fontSize: '1.25rem' }}>
          VoiceGuard
        </Link>
        <nav style={{ display: 'flex', gap: '1.25rem' }}>
          <Link to="/" style={{ color: isHome ? 'var(--accent)' : 'var(--text-muted)' }}>Home</Link>
          <Link to="/enroll" style={{ color: loc.pathname === '/enroll' ? 'var(--accent)' : 'var(--text-muted)' }}>Enroll</Link>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
