export interface VoicePrint {
  /** Average RMS (loudness) */
  rms: number
  /** Spectral centroid (brightness) */
  spectralCentroid: number
  /** Zero-crossing rate */
  zcr: number
  /** Duration in seconds */
  duration: number
  /** Sample rate used */
  sampleRate: number
  /** Raw extract for optional re-analysis */
  raw?: number[]
}

export interface SecurityQA {
  question: string
  answer: string
}

export interface EnrolledMember {
  id: string
  name: string
  /** 3 voice prints from enrollment */
  voicePrints: VoicePrint[]
  securityQuestions: SecurityQA[]
  enrolledAt: string
}

export type CallState = 'idle' | 'ringing' | 'analyzing' | 'verified' | 'suspicious' | 'challenge'
