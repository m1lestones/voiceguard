import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { createEnrollment } from '../lib/api'
import type { VoicePrint, SecurityQA } from '../types'

export function Enroll() {
  const nav = useNavigate()
  const { isRecording, error, start, stop } = useVoiceRecorder()
  const [name, setName] = useState('')
  const [samples, setSamples] = useState<VoicePrint[]>([])
  const [step, setStep] = useState<'name' | 'record' | 'questions' | 'done'>('name')
  const [q1, setQ1] = useState('')
  const [a1, setA1] = useState('')
  const [q2, setQ2] = useState('')
  const [a2, setA2] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleRecord = async () => {
    if (isRecording) {
      const { voicePrint } = await stop()
      if (voicePrint) setSamples((s) => [...s, voicePrint])
    } else {
      start()
    }
  }

  const handleNextFromRecord = () => {
    if (samples.length >= 2) setStep('questions')
  }

  const handleSave = async () => {
    const qa: SecurityQA[] = []
    if (q1.trim() && a1.trim()) qa.push({ question: q1.trim(), answer: a1.trim().toLowerCase() })
    if (q2.trim() && a2.trim()) qa.push({ question: q2.trim(), answer: a2.trim().toLowerCase() })
    if (qa.length < 1) return

    setSaving(true)
    setSaveError(null)
    try {
      await createEnrollment({
        familyMemberName: name.trim(),
        voiceSample: JSON.stringify({ voicePrints: samples, securityQuestions: qa }),
      })
      setStep('done')
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to enroll')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'name') {
    return (
      <div>
        <h1 style={{ margin: '0 0 1rem' }}>Enroll a family member</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Enter their name, then record 3 short voice samples and set security questions.
        </p>
        <input
          type="text"
          placeholder="Name (e.g. Mom, Dad, Sarah)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontSize: '1rem',
          }}
        />
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => setStep('record')}
            disabled={!name.trim()}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
            }}
          >
            Next: Record voice
          </button>
        </div>
      </div>
    )
  }

  if (step === 'record') {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem' }}>Record voice samples</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Record 3 clips (2–4 seconds each). Say something like: &ldquo;Hi, this is [name].&rdquo;
        </p>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
        <p style={{ marginBottom: '1rem' }}>
          Samples: <strong>{samples.length} / 3</strong>
        </p>
        <button
          onClick={handleRecord}
          style={{
            padding: '1rem 1.5rem',
            background: isRecording ? 'var(--danger)' : 'var(--accent)',
            color: isRecording ? '#fff' : 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            marginRight: '0.75rem',
          }}
        >
          {isRecording ? 'Stop' : 'Record'}
        </button>
        <button
          onClick={handleNextFromRecord}
          disabled={samples.length < 2}
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
          }}
        >
          Next: Security questions
        </button>
        <button onClick={() => setStep('name')} style={{ padding: '1rem 1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
          Back
        </button>
      </div>
    )
  }

  if (step === 'questions') {
    return (
      <div>
        <h1 style={{ margin: '0 0 0.5rem' }}>Security questions</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
          Only {name} would know these. Used when a caller is flagged as suspicious.
        </p>
        {saveError && <p style={{ color: 'var(--danger)', margin: '0 0 1rem' }}>{saveError}</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Question 1</label>
            <input
              type="text"
              placeholder="e.g. What was our first pet's name?"
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
              }}
            />
            <input
              type="text"
              placeholder="Answer"
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Question 2</label>
            <input
              type="text"
              placeholder="e.g. What street did we live on in 2015?"
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
              }}
            />
            <input
              type="text"
              placeholder="Answer"
              value={a2}
              onChange={(e) => setA2(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={saving || !(q1.trim() && a1.trim())}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
            }}
          >
            {saving ? 'Saving…' : 'Save and enroll'}
          </button>
          <button onClick={() => setStep('record')} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ margin: '0 0 0.5rem' }}>Enrolled</h1>
      <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
        <strong>{name}</strong> is now enrolled. Voice prints and security questions are saved.
      </p>
      <button
        onClick={() => nav('/')}
        style={{
          padding: '0.75rem 1.5rem',
          background: 'var(--accent)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
        }}
      >
        Back to Home
      </button>
    </div>
  )
}
