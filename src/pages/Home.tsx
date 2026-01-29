import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEnrollments } from '../lib/api'
import type { EnrolledMember } from '../types'

export function Home() {
  const [enrolled, setEnrolled] = useState<EnrolledMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getEnrollments()
      .then((list) => {
        if (!active) return
        setEnrolled(list)
      })
      .catch((e) => {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Failed to load enrollments')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

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

      {loading && (
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Loading enrolled members…</p>
      )}

      {!loading && error && (
        <p style={{ color: 'var(--danger)', margin: '0.5rem 0 0' }}>{error}</p>
      )}

      {!loading && !error && enrolled.length > 0 && (
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
