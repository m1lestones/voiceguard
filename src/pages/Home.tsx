import { Link } from 'react-router-dom'
import { getEnrolled } from '../lib/storage'

export function Home() {
  const enrolled = getEnrolled()

  return (
    <div>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>Protect your family from voice cloning scams</h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
        VoiceGuard verifies caller identity in real time and challenges suspicious callers with
        security questions only your family would know.
      </p>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Link
          to="/enroll"
          style={{
            display: 'block',
            padding: '1rem 1.25rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <strong>Enroll a family member</strong>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Record voice samples and set security questions
          </div>
        </Link>
        <Link
          to="/call"
          style={{
            display: 'block',
            padding: '1rem 1.25rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <strong>Simulate incoming call</strong>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Run real-time voice analysis and security challenge
          </div>
        </Link>
      </div>

      {enrolled.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>Enrolled ({enrolled.length})</h2>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
            {enrolled.map((e) => (
              <li key={e.id}>{e.name}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
