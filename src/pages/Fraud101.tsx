import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type LessonId = 'red-flags' | 'verify' | 'voice-clone' | 'money' | 'report'

const PROGRESS_KEY = 'voiceguard_fraud101_progress_v1'

type ProgressState = Record<LessonId, boolean>

const defaultProgress: ProgressState = {
  'red-flags': false,
  verify: false,
  'voice-clone': false,
  money: false,
  report: false,
}

type QuizAnswer = 'a' | 'b' | 'c'

type QuizQuestion = {
  id: string
  prompt: string
  answers: { key: QuizAnswer; text: string }[]
  correct: QuizAnswer
  explanation: string
}

const quiz: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'A caller says there\'s an emergency and you must act right now. What\'s the best first move?',
    answers: [
      { key: 'a', text: 'Stay on the line and follow instructions quickly' },
      { key: 'b', text: 'Pause and verify through a separate trusted channel' },
      { key: 'c', text: 'Send a small payment to prove you\'re helping' },
    ],
    correct: 'b',
    explanation: 'Urgency is a classic pressure tactic. Pause and verify via a known number or in-person check.',
  },
  {
    id: 'q2',
    prompt: 'Which is the safest way to handle a request for money during a suspicious call?',
    answers: [
      { key: 'a', text: 'Send gift cards because they\'re fast' },
      { key: 'b', text: 'Wire money to reduce delays' },
      { key: 'c', text: 'Do not pay on the call; verify and use your normal payment process' },
    ],
    correct: 'c',
    explanation: 'Scammers often push irreversible payment methods. Slow down and use your normal, verified process.',
  },
  {
    id: 'q3',
    prompt: 'A caller ID shows your bank\'s name. What should you assume?',
    answers: [
      { key: 'a', text: 'It\'s definitely your bank' },
      { key: 'b', text: 'Caller ID can be spoofed; verify independently' },
      { key: 'c', text: 'If the voice sounds right, it\'s safe' },
    ],
    correct: 'b',
    explanation: 'Caller ID can be spoofed. Hang up and call the number on the back of your card or official site.',
  },
  {
    id: 'q4',
    prompt: 'Which is a strong protection against voice-cloning impersonation?',
    answers: [
      { key: 'a', text: 'A shared family “safe word” or challenge question' },
      { key: 'b', text: 'Replying quickly before they get angry' },
      { key: 'c', text: 'Only trusting calls after 9pm' },
    ],
    correct: 'a',
    explanation: 'A secret phrase/challenge question is hard for an impersonator to guess, even with a cloned voice.',
  },
  {
    id: 'q5',
    prompt: 'If something feels off, what\'s a smart reporting step?',
    answers: [
      { key: 'a', text: 'Ignore it so you don\'t waste time' },
      { key: 'b', text: 'Post the number publicly with personal details' },
      { key: 'c', text: 'Document details and report to the relevant service/agency' },
    ],
    correct: 'c',
    explanation: 'Documenting and reporting helps protect you and others, and can help your bank/carrier investigate.',
  },
]

type ResourceLink = {
  title: string
  href: string
  description: string
  badge?: string
}

const usaResources: ResourceLink[] = [
  {
    title: 'ReportFraud.ftc.gov (FTC)',
    href: 'https://reportfraud.ftc.gov/',
    description: 'Report scams, fraud, and bad business practices (U.S.).',
    badge: 'Report',
  },
  {
    title: 'IdentityTheft.gov (FTC)',
    href: 'https://www.identitytheft.gov/',
    description: 'Report identity theft and get a step-by-step recovery plan.',
    badge: 'Recover',
  },
  {
    title: 'FBI IC3',
    href: 'https://www.ic3.gov/',
    description: 'Report cyber-enabled fraud and online crime (Internet Crime Complaint Center).',
    badge: 'Report',
  },
  {
    title: 'USA.gov — Stop scams and fraud',
    href: 'https://www.usa.gov/stop-scams-frauds',
    description: 'Find the right U.S. agency to report different scam types.',
    badge: 'Directory',
  },
  {
    title: 'CFPB — Fraud and scams',
    href: 'https://www.consumerfinance.gov/consumer-tools/fraud/',
    description: 'Practical guidance for recognizing, reporting, and recovering from scams.',
    badge: 'Learn',
  },
]

const travelFriendlyInternational: Array<{ region: string; links: ResourceLink[] }> = [
  {
    region: 'International (cross-border purchases)',
    links: [
      {
        title: 'econsumer.gov (ICPEN)',
        href: 'https://econsumer.gov/',
        description: 'Report international online shopping scams and cross-border consumer fraud.',
        badge: 'Report',
      },
    ],
  },
  {
    region: 'Canada',
    links: [
      {
        title: 'Canadian Anti-Fraud Centre (CAFC) — Report fraud',
        href: 'https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm',
        description: 'How to report fraud/cybercrime in Canada; includes online reporting portal.',
        badge: 'Report',
      },
    ],
  },
  {
    region: 'United Kingdom',
    links: [
      {
        title: 'Action Fraud',
        href: 'https://www.actionfraud.police.uk/',
        description: 'UK\'s national reporting centre for fraud and cyber crime.',
        badge: 'Report',
      },
      {
        title: 'NCSC — Phishing & scams',
        href: 'https://www.ncsc.gov.uk/collection/phishing-scams',
        description: 'How to spot and report scam emails, texts, websites, and calls (UK).',
        badge: 'Learn',
      },
    ],
  },
  {
    region: 'European Union (travel within EU)',
    links: [
      {
        title: 'Europol — Report a crime',
        href: 'https://www.europol.europa.eu/report-a-crime',
        description: 'Find your country\'s police reporting links and guidance (EU).',
        badge: 'Directory',
      },
    ],
  },
  {
    region: 'Australia',
    links: [
      {
        title: 'Scamwatch (ACCC)',
        href: 'https://www.scamwatch.gov.au/',
        description: 'Scam alerts, education, and what to do if you\'ve been scammed (AU).',
        badge: 'Learn',
      },
      {
        title: 'ReportCyber (ACSC)',
        href: 'https://www.cyber.gov.au/report-and-recover/report',
        description: 'Report cybercrime and incidents (AU).',
        badge: 'Report',
      },
    ],
  },
  {
    region: 'Singapore',
    links: [
      {
        title: 'ScamShield',
        href: 'https://www.scamshield.gov.sg/',
        description: 'Check, report, and learn about scam trends and protections (SG).',
        badge: 'Report',
      },
    ],
  },
]

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return defaultProgress
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return { ...defaultProgress, ...parsed }
  } catch {
    return defaultProgress
  }
}

function saveProgress(state: ProgressState) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state))
}

export function Fraud101() {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, QuizAnswer | null>>(() => {
    const init: Record<string, QuizAnswer | null> = {}
    for (const q of quiz) init[q.id] = null
    return init
  })
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  useEffect(() => {
    setProgress(loadProgress())
  }, [])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const completedCount = useMemo(() => Object.values(progress).filter(Boolean).length, [progress])

  const score = useMemo(() => {
    if (!quizSubmitted) return null
    let points = 0
    for (const q of quiz) {
      if (quizAnswers[q.id] === q.correct) points += 1
    }
    return points
  }, [quizAnswers, quizSubmitted])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.6rem' }}>Fraud 101</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
          Progress: <strong style={{ color: 'var(--text)' }}>{completedCount}/5</strong>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem' }}>
        A short, practical course to help you recognize common fraud patterns, especially voice-cloning scams.
      </p>

      <section
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Lessons</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.25rem', marginBottom: '.75rem' }}>
          Check off lessons as you go.
        </div>

        <div style={{ display: 'grid', gap: '.75rem' }}>
          <Lesson
            id="red-flags"
            title="Red flags that show up everywhere"
            progress={progress}
            setProgress={setProgress}
            bullets={[
              'Urgency: “do it now” pressure, threats, or deadlines',
              'Secrecy: “don\'t tell anyone” or “stay on the line”',
              'Authority: pretending to be police, bank, or a relative',
            ]}
          />
          <Lesson
            id="verify"
            title="Verification habits (your best defense)"
            progress={progress}
            setProgress={setProgress}
            bullets={[
              'Hang up and call back using a known-good number',
              'Use a family safe-word or a challenge question',
              'If you\'re unsure, slow down: verify before acting',
            ]}
          />
          <Lesson
            id="voice-clone"
            title="Voice-cloning & impersonation basics"
            progress={progress}
            setProgress={setProgress}
            bullets={[
              'A familiar voice is not proof of identity',
              'Cloned voices often push urgency and emotion',
              'Use VoiceGuard challenges when a call feels “off”',
            ]}
          />
          <Lesson
            id="money"
            title="Money safety rules"
            progress={progress}
            setProgress={setProgress}
            bullets={[
              'Gift cards, crypto, and wire transfers are scam favorites',
              'Never share one-time codes or password reset links',
              'Use your normal payment flow only after verification',
            ]}
          />
          <Lesson
            id="report"
            title="What to document and where to report"
            progress={progress}
            setProgress={setProgress}
            bullets={[
              'Write down numbers, times, names, and what was requested',
              'Report to your bank/service provider if financial info is involved',
              'Report scams to appropriate agencies in your region',
            ]}
          />
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setProgress(defaultProgress)}
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text)',
              padding: '.55rem .8rem',
              cursor: 'pointer',
            }}
          >
            Reset progress
          </button>
          <Link
            to="/call"
            style={{
              borderRadius: 'var(--radius)',
              border: '1px solid transparent',
              background: 'var(--accent)',
              color: '#041216',
              padding: '.55rem .8rem',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Practice with a simulated call
          </Link>
        </div>
      </section>

      <section
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Report & learn more (official resources)</h2>
        <p style={{ margin: '.35rem 0 .9rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>
          If you\'re in immediate danger, contact local emergency services. Otherwise, these links help you report scams and get recovery steps.
        </p>

        <div style={{ marginBottom: '.85rem' }}>
          <div style={{ fontWeight: 800, marginBottom: '.4rem' }}>USA</div>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            {usaResources.map((r) => (
              <ResourceCard key={r.href} r={r} />
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '.85rem' }}>
          {travelFriendlyInternational.map((group) => (
            <div key={group.region}>
              <div style={{ fontWeight: 800, marginBottom: '.4rem' }}>{group.region}</div>
              <div style={{ display: 'grid', gap: '.6rem' }}>
                {group.links.map((r) => (
                  <ResourceCard key={r.href} r={r} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-soft)',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1rem' }}>Quick self-check (5 questions)</h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginTop: '.25rem', marginBottom: '.75rem' }}>
          Answer honestly — this is just to build the habit.
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setQuizSubmitted(true)
          }}
          style={{ display: 'grid', gap: '.9rem' }}
        >
          {quiz.map((q) => {
            const chosen = quizAnswers[q.id]
            const isCorrect = quizSubmitted ? chosen === q.correct : null
            return (
              <fieldset
                key={q.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '.75rem .9rem',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <legend style={{ padding: '0 .35rem', color: 'var(--text)', fontWeight: 700 }}>
                  {q.prompt}
                </legend>

                <div style={{ display: 'grid', gap: '.35rem' }}>
                  {q.answers.map((a) => (
                    <label key={a.key} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', color: 'var(--text-muted)' }}>
                      <input
                        type="radio"
                        name={q.id}
                        value={a.key}
                        checked={chosen === a.key}
                        onChange={() => {
                          setQuizSubmitted(false)
                          setQuizAnswers((prev) => ({ ...prev, [q.id]: a.key }))
                        }}
                      />
                      <span>{a.text}</span>
                    </label>
                  ))}
                </div>

                {quizSubmitted && (
                  <div
                    style={{
                      marginTop: '.6rem',
                      fontSize: '.9rem',
                      color: isCorrect ? 'var(--accent)' : 'var(--warn)',
                    }}
                  >
                    {isCorrect ? 'Correct.' : 'Not quite.'} <span style={{ color: 'var(--text-muted)' }}>{q.explanation}</span>
                  </div>
                )}
              </fieldset>
            )
          })}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              style={{
                borderRadius: 'var(--radius)',
                border: '1px solid transparent',
                background: 'var(--signal)',
                color: '#0a0616',
                padding: '.6rem .9rem',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              Check answers
            </button>

            {score !== null && (
              <div style={{ color: 'var(--text-muted)', fontSize: '.95rem' }}>
                Score: <strong style={{ color: 'var(--text)' }}>{score}/{quiz.length}</strong>
              </div>
            )}
          </div>
        </form>
      </section>

      <div style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
        Want to protect your household? <Link to="/enroll">Enroll family members</Link> and set up challenge questions.
      </div>
    </div>
  )
}

function ResourceCard({ r }: { r: ResourceLink }) {
  const badge = r.badge?.trim()
  const badgeDotClass = (() => {
    if (!badge) return 'vg-chipDot'
    const key = badge.toLowerCase()
    if (key === 'report') return 'vg-chipDot vg-chipDot--danger'
    if (key === 'recover') return 'vg-chipDot vg-chipDot--accent'
    if (key === 'learn') return 'vg-chipDot vg-chipDot--signal'
    if (key === 'directory') return 'vg-chipDot vg-chipDot--warn'
    return 'vg-chipDot'
  })()

  return (
    <a
      href={r.href}
      target="_blank"
      rel="noreferrer"
      className="vg-cardLink"
      style={{
        display: 'block',
        padding: '.75rem .9rem',
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.02)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.75rem' }}>
        <div style={{ fontWeight: 800 }}>{r.title}</div>
        {badge && (
          <span className="vg-chip" style={{ whiteSpace: 'nowrap' }}>
            <span className={badgeDotClass} />
            {badge}
          </span>
        )}
      </div>
      <div style={{ marginTop: '.25rem', color: 'var(--text-muted)', fontSize: '.9rem' }}>{r.description}</div>
    </a>
  )
}

function Lesson({
  id,
  title,
  bullets,
  progress,
  setProgress,
}: {
  id: LessonId
  title: string
  bullets: string[]
  progress: ProgressState
  setProgress: React.Dispatch<React.SetStateAction<ProgressState>>
}) {
  const checked = progress[id]
  return (
    <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start' }}>
      <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setProgress((p) => ({ ...p, [id]: e.target.checked }))}
          aria-label={`Mark lesson as complete: ${title}`}
        />
      </label>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, marginBottom: '.25rem' }}>{title}</div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
