import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useScrollTheme } from '../hooks/useScrollTheme'
import { useAuth } from '../contexts/AuthContext'

export function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  const nav = useNavigate()
  const { token, logout } = useAuth()
  const isHome = loc.pathname === '/'

  useScrollTheme()

  const handleLogout = () => {
    logout()
    nav('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        aria-hidden
        className="vg-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background: 'var(--bg-gradient)',
          transform: 'translateZ(0)',
          filter: 'saturate(1.08) contrast(1.02)',
          pointerEvents: 'none',
        }}
      />
      <header
        className="vg-header"
        style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)',
        }}
      >
        <Link
          to="/"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '.6rem',
          }}
        >
          <img src="/voiceguard.svg" alt="VoiceGuard" width={22} height={22} style={{ display: 'block' }} />
          <span>VoiceGuard</span>
        </Link>
        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: isHome ? 'var(--accent)' : 'var(--text-muted)' }}>Home</Link>
          <Link to="/enroll" style={{ color: loc.pathname === '/enroll' ? 'var(--accent)' : 'var(--text-muted)' }}>Enroll</Link>
          <Link to="/fraud-101" style={{ color: loc.pathname === '/fraud-101' ? 'var(--accent)' : 'var(--text-muted)' }}>Fraud 101</Link>
          <Link to="/stats" style={{ color: loc.pathname === '/stats' ? 'var(--accent)' : 'var(--text-muted)' }}>Stats</Link>
          {token ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '0.4rem 0.75rem',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Log out
            </button>
          ) : (
            <Link to="/auth" style={{ color: loc.pathname === '/auth' ? 'var(--accent)' : 'var(--text-muted)' }}>Log in</Link>
          )}
        </nav>

        <div className="vg-scrollProgress" aria-hidden>
          <div className="vg-scrollProgressFill" />
        </div>
      </header>
      <main className="vg-main" style={{ flex: 1, padding: '1.5rem', maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <div key={loc.pathname} className="vg-page">
          {children}
        </div>
      </main>

      <button
        type="button"
        className="vg-backToTop"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        Top
      </button>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
        }}
      >
        <div
          style={{
            maxWidth: 560,
            margin: '0 auto',
            width: '100%',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }} aria-label="Community">
            <img src="/illustrations/parent-1.svg" alt="" width={34} height={24} style={{ borderRadius: 10 }} />
            <img src="/illustrations/parent-2.svg" alt="" width={34} height={24} style={{ borderRadius: 10 }} />
            <img src="/illustrations/sibling-1.svg" alt="" width={34} height={24} style={{ borderRadius: 10 }} />
            <img src="/illustrations/friend-1.svg" alt="" width={34} height={24} style={{ borderRadius: 10 }} />
            <img src="/illustrations/grandparent-1.svg" alt="" width={34} height={24} style={{ borderRadius: 10 }} />
            <img src="/illustrations/cousin-1.svg" alt="" width={34} height={24} style={{ borderRadius: 10 }} />
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
            Built to help protect <strong style={{ color: 'var(--text)' }}>every family</strong> from fraud and impersonation.
          </div>
        </div>
      </footer>
    </div>
  )
}
