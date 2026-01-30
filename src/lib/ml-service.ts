/**
 * ML service using Deepgram (free tier) for speech-to-text.
 * Used to combine transcript confidence with heuristics for clone/synthetic detection.
 */

const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true'

export interface MLTranscriptResult {
  /** Overall confidence 0–1 from Deepgram */
  confidence: number
  /** Transcript text */
  text: string
}

/**
 * Send audio blob to Deepgram for transcription.
 * Returns null if VITE_DEEPGRAM_API_KEY is missing or request fails (caller can fall back to heuristics only).
 */
export async function transcribeWithDeepgram(blob: Blob): Promise<MLTranscriptResult | null> {
  const apiKey = import.meta.env.VITE_DEEPGRAM_API_KEY
  if (!apiKey || typeof apiKey !== 'string') return null

  try {
    const res = await fetch(DEEPGRAM_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': blob.type || 'audio/webm',
      },
      body: blob,
    })
    if (!res.ok) return null
    const data = (await res.json()) as DeepgramResponse
    const channel = data?.results?.channels?.[0]
    const alt = channel?.alternatives?.[0]
    if (!alt) return null
    return {
      confidence: typeof alt.confidence === 'number' ? alt.confidence : 0,
      text: typeof alt.transcript === 'string' ? alt.transcript.trim() : '',
    }
  } catch {
    return null
  }
}

interface DeepgramResponse {
  results?: {
    channels?: Array<{
      alternatives?: Array<{ transcript?: string; confidence?: number }>
    }>
  }
}
