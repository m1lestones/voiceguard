import type { EnrolledMember } from '../types'

const KEY = 'voiceguard_enrolled'

export function getEnrolled(): EnrolledMember[] {
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : []
  } catch {
    return []
  }
}

export function saveEnrolled(list: EnrolledMember[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function addEnrolled(m: EnrolledMember): void {
  const list = getEnrolled()
  if (list.some((e) => e.id === m.id)) {
    saveEnrolled(list.map((e) => (e.id === m.id ? m : e)))
  } else {
    saveEnrolled([...list, m])
  }
}

export function removeEnrolled(id: string): void {
  saveEnrolled(getEnrolled().filter((e) => e.id !== id))
}

export function getEnrolledById(id: string): EnrolledMember | undefined {
  return getEnrolled().find((e) => e.id === id)
}
