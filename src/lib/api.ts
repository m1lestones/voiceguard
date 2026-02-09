import type { EnrolledMember, SecurityQA, VoicePrint } from '../types'

const AUTH_STORAGE_KEY = 'voiceguard_token'
const DEFAULT_API_URL = 'http://localhost:3000'

export function getToken(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export type AnalyzeResult = {
  status: 'GREEN' | 'YELLOW' | 'RED'
  matchScore: number
  syntheticProbability: number
  message?: string
}

function getApiBaseUrl(): string {
  const raw = (import.meta as any)?.env?.VITE_API_URL as string | undefined
  const base = (raw ?? DEFAULT_API_URL).trim()
  return base.endsWith('/') ? base.slice(0, -1) : base
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((init?.headers as Record<string, string>) ?? {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(url, { ...init, headers })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as unknown) : undefined

  if (!res.ok) {
    const msg = (data as any)?.message ?? (data as any)?.error ?? res.statusText
    throw new Error(typeof msg === 'string' ? msg : `Request failed (${res.status})`)
  }

  return data as T
}

// Auth
export async function login(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
  const data = await apiFetch<{ token: string; user: { id: string; email: string } }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  })
  return data
}

export async function register(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
  const data = await apiFetch<{ token: string; user: { id: string; email: string } }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), password }),
  })
  return data
}

// Members (enrollments)
function rowToMember(row: { id: string; name: string; voicePrints?: VoicePrint[]; securityQuestions?: SecurityQA[]; enrolledAt: string }): EnrolledMember {
  return {
    id: row.id,
    name: row.name,
    voicePrints: Array.isArray(row.voicePrints) ? row.voicePrints : [],
    securityQuestions: Array.isArray(row.securityQuestions) ? row.securityQuestions : [],
    enrolledAt: row.enrolledAt,
  }
}

export async function getEnrollments(): Promise<EnrolledMember[]> {
  const rows = await apiFetch<EnrolledMember[] | { id: string; name: string; voicePrints?: VoicePrint[]; securityQuestions?: SecurityQA[]; enrolledAt: string }[]>('/api/members')
  const list = Array.isArray(rows) ? rows : []
  return list.map((r) => rowToMember(r))
}

export async function createEnrollment(input: {
  familyMemberName: string
  voiceSample?: string
}): Promise<EnrolledMember> {
  let voicePrints: VoicePrint[] = []
  let securityQuestions: SecurityQA[] = []
  if (input.voiceSample) {
    try {
      const parsed = JSON.parse(input.voiceSample) as { voicePrints?: VoicePrint[]; securityQuestions?: SecurityQA[] }
      voicePrints = Array.isArray(parsed?.voicePrints) ? parsed.voicePrints : []
      securityQuestions = Array.isArray(parsed?.securityQuestions) ? parsed.securityQuestions : []
    } catch {
      /* ignore */
    }
  }
  const data = await apiFetch<{ id: string; name: string; voicePrints?: VoicePrint[]; securityQuestions?: SecurityQA[]; enrolledAt: string }>('/api/members', {
    method: 'POST',
    body: JSON.stringify({
      name: input.familyMemberName.trim(),
      voicePrints,
      securityQuestions,
    }),
  })
  return rowToMember(data)
}

export async function analyzeCall(input: { claimedIdentity?: string; audioSample?: string }): Promise<AnalyzeResult> {
  const data = await apiFetch<{ ok: boolean; result: AnalyzeResult }>('/api/calls/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if ((data as any)?.ok !== true) throw new Error('Failed to analyze call')
  return (data as any).result
}
