import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { EnrolledMember, SecurityQA } from '../types'

export function SecurityChallenge() {
  const nav = useNavigate()
  const loc = useLocation()
  const member = (loc.state as { member?: EnrolledMember })?.member
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [failed, setFailed] = useState(false)
  const [passed, setPassed] = useState(false)

  const qa: SecurityQA[] = member?.securityQuestions ?? []
  const current = qa[index]

  useEffect(() => {
    if (!member) nav('/call')
  }, [member, nav])

  const check = () => {
    if (!current) return
    const correct = answer.trim().toLowerCase() === current.answer
    if (correct) {
      if (index + 1 >= qa.length) {
        setPassed(true)
      } else {
        setIndex((i) => i + 1)
        setAnswer('')
      }
    } else {
      setFailed(true)
    }
  }

  if (!member) return null

  if (passed) {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem', color: 'var(--accent)' }}>Security questions passed</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          {member.name} correctly answered. Proceed with caution and trust your judgement.
        </p>
        <button
          onClick={() => nav('/call')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
          }}
        >
          Back to call
        </button>
      </div>
    )
  }

  if (failed) {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem', color: 'var(--danger)' }}>Verification failed</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          The caller could not answer correctly. This may be an impersonation or voice clone. Do not share money or sensitive information.
        </p>
        <button
          onClick={() => nav('/call')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--danger)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
          }}
        >
          End call
        </button>
      </div>
    )
  }

  if (!current) {
    return (
      <div>
        <p style={{ color: 'var(--text-muted)' }}>No security questions set. Go back to call.</p>
        <button onClick={() => nav('/call')} style={{ padding: '0.5rem 1rem', marginTop: '0.5rem' }}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 0.5rem' }}>Security challenge</h1>
      <p style={{ color: 'var(--warn)', margin: '0 0 1rem' }}>
        Voice did not match {member.name}. Answer to continue.
      </p>
      <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{current.question}</p>
      <input
        type="text"
        placeholder="Your answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && check()}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          color: 'var(--text)',
          fontSize: '1rem',
          marginBottom: '1rem',
        }}
      />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={check}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
          }}
        >
          Submit
        </button>
        <button
          onClick={() => nav('/call')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
          }}
        >
          Hang up
        </button>
      </div>
    </div>
  )
}
