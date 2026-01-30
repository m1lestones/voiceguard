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

      <section
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', minWidth: 240 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '.25rem' }}>
              Fraud prevention for everyone
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '.5rem' }}>
              Voice scams target all of us — VoiceGuard is built to help everyone stay safe.
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
              <li>Detect impersonation and suspicious voice patterns</li>
              <li>Use security questions when the call feels off</li>
              <li>Designed to support families, friends, and communities</li>
            </ul>
          </div>

          <div style={{ flex: '1 1 220px', minWidth: 220, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
            <img src="/illustrations/parent-1.svg" alt="Illustration of a person" style={{ width: '100%', height: 'auto', borderRadius: 14 }} />
            <img src="/illustrations/parent-2.svg" alt="Illustration of a person" style={{ width: '100%', height: 'auto', borderRadius: 14 }} />
            <img src="/illustrations/sibling-1.svg" alt="Illustration of two people" style={{ width: '100%', height: 'auto', borderRadius: 14 }} />
            <img src="/illustrations/friend-1.svg" alt="Illustration of a person" style={{ width: '100%', height: 'auto', borderRadius: 14 }} />
          </div>
        </div>
      </section>

      <section
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', minWidth: 240 }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '.25rem' }}>Mini course</div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '.5rem' }}>Fraud 101: learn the patterns</div>
            <p style={{ margin: '0 0 .75rem', color: 'var(--text-muted)' }}>
              A short, practical guide to help you spot urgency tactics, verify identity, and stay safe from voice-cloning scams.
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
              <li>5 bite-sized lessons</li>
              <li>Quick safety checklist</li>
              <li>5-question self-check quiz</li>
            </ul>
          </div>

          <div style={{ flex: '0 0 auto', display: 'grid', gap: '.6rem', alignContent: 'start' }}>
            <Link
              to="/fraud-101"
              style={{
                display: 'inline-block',
                padding: '.7rem 1rem',
                background: 'var(--signal)',
                border: '1px solid transparent',
                borderRadius: 'var(--radius)',
                color: '#0a0616',
                textDecoration: 'none',
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              Start Fraud 101
            </Link>
            <div style={{ display: 'flex', gap: '.5rem' }} aria-hidden="true">
              <img src="/illustrations/grandparent-1.svg" alt="" width={44} height={30} style={{ borderRadius: 12 }} />
              <img src="/illustrations/cousin-1.svg" alt="" width={44} height={30} style={{ borderRadius: 12 }} />
              <img src="/illustrations/friend-1.svg" alt="" width={44} height={30} style={{ borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <Link
          to="/stats"
          className="vg-cardLink"
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
          <strong>View fraud stats</strong>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Explore charts by region, demographics, and scam type
          </div>
          <div className="vg-chipRow" aria-hidden>
            <span className="vg-chip"><span className="vg-chipDot vg-chipDot--signal" />Official (free)</span>
            <span className="vg-chip"><span className="vg-chipDot" />Charts</span>
            <span className="vg-chip"><span className="vg-chipDot vg-chipDot--warn" />CSV upload</span>
          </div>
        </Link>
        <Link
          to="/enroll"
          className="vg-cardLink"
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
          <div className="vg-chipRow" aria-hidden>
            <span className="vg-chip"><span className="vg-chipDot" />Voice samples</span>
            <span className="vg-chip"><span className="vg-chipDot vg-chipDot--signal" />Security questions</span>
            <span className="vg-chip"><span className="vg-chipDot vg-chipDot--warn" />Family-ready</span>
          </div>
        </Link>
        <Link
          to="/call"
          className="vg-cardLink"
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
          <div className="vg-chipRow" aria-hidden>
            <span className="vg-chip"><span className="vg-chipDot vg-chipDot--danger" />Suspicious caller</span>
            <span className="vg-chip"><span className="vg-chipDot" />Detection</span>
            <span className="vg-chip"><span className="vg-chipDot vg-chipDot--signal" />Challenge flow</span>
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
