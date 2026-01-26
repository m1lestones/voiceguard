import type { VoicePrint, EnrolledMember } from '../types'

const TOLERANCE_RMS = 0.35
const TOLERANCE_SPECTRAL = 800
const TOLERANCE_ZCR = 0.08
const DEVIATION_THRESHOLD = 0.6

/**
 * Compare a live voice print to enrolled prints.
 * Returns a suspicion score 0–1: higher = more likely AI clone or impersonator.
 */
export function getSuspicionScore(live: VoicePrint, enrolled: EnrolledMember): number {
  const prints = enrolled.voicePrints
  if (prints.length === 0) return 0.9

  let bestMatch = 1
  for (const p of prints) {
    const rmsDev = Math.abs(live.rms - p.rms) / (p.rms || 0.001)
    const specDev = Math.abs(live.spectralCentroid - p.spectralCentroid)
    const zcrDev = Math.abs(live.zcr - p.zcr)
    const rmsScore = Math.min(1, rmsDev / TOLERANCE_RMS)
    const specScore = Math.min(1, specDev / TOLERANCE_SPECTRAL)
    const zcrScore = Math.min(1, zcrDev / TOLERANCE_ZCR)
    const combined = (rmsScore + specScore + zcrScore) / 3
    if (combined < bestMatch) bestMatch = combined
  }
  return Math.min(1, bestMatch)
}

/**
 * Heuristics that can suggest synthetic/AI-cloned voice:
 * - Unusually uniform or "too clean" stats
 * - Duration too short or artifact-like
 */
export function getSyntheticIndicators(print: VoicePrint): { score: number; reasons: string[] } {
  const reasons: string[] = []
  let score = 0
  if (print.duration < 1) {
    reasons.push('Very short sample')
    score += 0.2
  }
  if (print.zcr > 0.12) {
    reasons.push('Unusual zero-crossing pattern')
    score += 0.15
  }
  if (print.spectralCentroid > 4000 && print.rms < 0.02) {
    reasons.push('Thin, synthetic-like spectrum')
    score += 0.2
  }
  return { score: Math.min(1, score), reasons }
}

export function isSuspicious(live: VoicePrint, enrolled: EnrolledMember): boolean {
  const matchScore = getSuspicionScore(live, enrolled)
  const { score: synthScore } = getSyntheticIndicators(live)
  const combined = Math.max(matchScore, synthScore * 1.2)
  return combined >= DEVIATION_THRESHOLD
}
