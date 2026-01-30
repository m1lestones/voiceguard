import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeCall, getEnrollments } from '../lib/api'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { isSuspicious, getSuspicionScore } from '../lib/detection'
import type { EnrolledMember, VoicePrint, CallState } from '../types'

export function Call() {
  const nav = useNavigate()
  const [enrolled, setEnrolled] = useState<EnrolledMember[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const { isRecording, error, start, stop } = useVoiceRecorder()
  const [state, setState] = useState<CallState>('idle')
  const [selected, setSelected] = useState<EnrolledMember | null>(null)
  const [analysis, setAnalysis] = useState<{ print: VoicePrint; score: number } | null>(null)
  const [backendStatus, setBackendStatus] = useState<'GREEN' | 'YELLOW' | 'RED' | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(null)
    getEnrollments()
      .then((list) => {
        if (!active) return
        setEnrolled(list)
      })
      .catch((e) => {
        if (!active) return
        setLoadError(e instanceof Error ? e.message : 'Failed to load enrollments')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handlePick = (m: EnrolledMember) => {
    setSelected(m)
    setState('ringing')
  }

  const handleAnswer = async () => {
    if (!selected) return
    setState('analyzing')
    start()
  }

  const handleHangupAnalyzing = async () => {
    const p = await stop()
    if (!p || !selected) {
      setState('idle')
      setSelected(null)
      return
    }
    const score = getSuspicionScore(p, selected)
    setAnalysis({ print: p, score })
    setBackendStatus(null)
    analyzeCall({ claimedIdentity: selected.name, audioSample: JSON.stringify(p) })
      .then((r) => setBackendStatus(r.status))
      .catch(() => setBackendStatus(null))
    const suspicious = isSuspicious(p, selected)
    if (suspicious) {
      setState('challenge')
      nav('/challenge', { state: { member: selected } })
    } else {
      setState('verified')
    }
  }

  const handleHangup = () => {
    setState('idle')
    setSelected(null)
    setAnalysis(null)
    setBackendStatus(null)
  }

  if (loading) {
    return (
      <div>
        <h1 style={{ margin: '0 0 1rem' }}>Simulate incoming call</h1>
        <p style={{ color: 'var(--text-muted)' }}>Loading enrolled members…</p>
      </div>
    )
  }

  if (!loading && loadError) {
    return (
      <div>
        <h1 style={{ margin: '0 0 1rem' }}>Simulate incoming call</h1>
        <p style={{ color: 'var(--danger)', margin: '0 0 1rem' }}>{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (enrolled.length === 0) {
    return (
      <div>
        <h1 style={{ margin: '0 0 1rem' }}>Simulate incoming call</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Enroll at least one family member first.
        </p>
        <button
          onClick={() => nav('/enroll')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
          }}
        >
          Enroll
        </button>
      </div>
    )
  }

  if (state === 'idle' || state === 'ringing') {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem' }}>Incoming call</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Who is calling? We&apos;ll analyze their voice in real time.
        </p>
        {state === 'ringing' && selected && (
          <p style={{ marginBottom: '1rem' }}>Caller: <strong>{selected.name}</strong></p>
        )}
        {state === 'idle' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {enrolled.map((m) => (
              <button
                key={m.id}
                onClick={() => handlePick(m)}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  textAlign: 'left',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        ) : (
          <>
            {error && <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleAnswer}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'var(--accent)',
                  color: 'var(--bg)',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  fontWeight: 600,
                }}
              >
                Answer & analyze
              </button>
              <button
                onClick={handleHangup}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                }}
              >
                Decline
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  if (state === 'analyzing') {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem' }}>Analyzing voice…</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Speak for 2–4 seconds, then click Stop. We&apos;ll compare to {selected?.name}&apos;s voice print.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          {isRecording ? (
            <span style={{ color: 'var(--danger)' }}>● Recording</span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Stopped — click below to see result</span>
          )}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleHangupAnalyzing}
            style={{
              padding: '1rem 1.5rem',
              background: isRecording ? 'var(--danger)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
            }}
          >
            {isRecording ? 'Stop & analyze' : 'Get result'}
          </button>
          <button
            onClick={() => { stop(); setState('idle'); setSelected(null); }}
            style={{
              padding: '1rem 1.5rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (state === 'verified') {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Verified</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Voice matched {selected?.name}. Suspicion score: {analysis ? (analysis.score * 100).toFixed(0) : '—'}%
        </p>
        {backendStatus && (
          <p style={{ color: 'var(--text-muted)', margin: '-0.5rem 0 1rem' }}>
            API analysis status: <strong>{backendStatus}</strong>
          </p>
        )}
        <button
          onClick={handleHangup}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
          }}
        >
          End
        </button>
      </div>
    )
  }

  return null
}
