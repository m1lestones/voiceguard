import type { EnrolledMember, SecurityQA, VoicePrint } from '../types'

type ApiOk<T> = T & { ok: true }

type ApiError = {
  ok: false
  error?: unknown
  message?: string
}

export type ApiEnrollment = {
  id: string
  familyMemberName: string
  relationship?: string
  phoneNumber?: string
  voiceSample?: string
  createdAt: string
}

export type AnalyzeResult = {
  status: 'GREEN' | 'YELLOW' | 'RED'
  matchScore: number
  syntheticProbability: number
  message?: string
}

const DEFAULT_API_URL = 'http://localhost:8080'

function getApiBaseUrl(): string {
  const raw = (import.meta as any)?.env?.VITE_API_URL as string | undefined
  const base = (raw ?? DEFAULT_API_URL).trim()
  return base.endsWith('/') ? base.slice(0, -1) : base
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : undefined

  if (!res.ok) {
    const msg = (data as any)?.message ?? (data as any)?.error ?? res.statusText
    throw new Error(typeof msg === 'string' ? msg : `Request failed (${res.status})`)
  }

  return data as T
}

function safeParseVoiceSample(voiceSample?: string): { voicePrints: VoicePrint[]; securityQuestions: SecurityQA[] } {
  if (!voiceSample) return { voicePrints: [], securityQuestions: [] }
  try {
    const parsed = JSON.parse(voiceSample) as any
    return {
      voicePrints: Array.isArray(parsed?.voicePrints) ? (parsed.voicePrints as VoicePrint[]) : [],
      securityQuestions: Array.isArray(parsed?.securityQuestions) ? (parsed.securityQuestions as SecurityQA[]) : [],
    }
  } catch {
    return { voicePrints: [], securityQuestions: [] }
  }
}

export function enrollmentToMember(e: ApiEnrollment): EnrolledMember {
  const extras = safeParseVoiceSample(e.voiceSample)
  return {
    id: e.id,
    name: e.familyMemberName,
    voicePrints: extras.voicePrints,
    securityQuestions: extras.securityQuestions,
    enrolledAt: e.createdAt,
  }
}

export async function getEnrollments(): Promise<EnrolledMember[]> {
  const data = await apiFetch<ApiOk<{ enrollments: ApiEnrollment[] }> | ApiError>('/enrollments')
  if ((data as any)?.ok !== true) throw new Error('Failed to load enrollments')
  return (data as any).enrollments.map(enrollmentToMember)
}

export async function createEnrollment(input: {
  familyMemberName: string
  relationship?: string
  phoneNumber?: string
  voiceSample?: string
}): Promise<EnrolledMember> {
  const data = await apiFetch<ApiOk<{ enrollment: ApiEnrollment }> | ApiError>('/enrollments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if ((data as any)?.ok !== true) throw new Error('Failed to create enrollment')
  return enrollmentToMember((data as any).enrollment)
}

export async function analyzeCall(input: { claimedIdentity?: string; audioSample?: string }): Promise<AnalyzeResult> {
  const data = await apiFetch<ApiOk<{ result: AnalyzeResult }> | ApiError>('/calls/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if ((data as any)?.ok !== true) throw new Error('Failed to analyze call')
  return (data as any).result
}

export async function reportScam(input: {
  phoneNumber: string
  claimedIdentity?: string
  timestamp?: string
  notes?: string
}): Promise<void> {
  const data = await apiFetch<ApiOk<{ report: unknown }> | ApiError>('/scams/report', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if ((data as any)?.ok !== true) throw new Error('Failed to report scam')
}
