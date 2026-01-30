import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoicePrint } from '../types'

const SAMPLE_RATE = 44100

/** Stop all tracks on a stream and clear refs. Call this whenever we're done with the mic. */
function releaseStream(stream: MediaStream | null): void {
  if (!stream) return
  stream.getTracks().forEach((t) => {
    t.stop()
  })
}

function getRms(samples: Float32Array): number {
  let sum = 0
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
  return Math.sqrt(sum / samples.length)
}

function getZcr(samples: Float32Array): number {
  let crosses = 0
  for (let i = 1; i < samples.length; i++)
    if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) crosses++
  return crosses / (samples.length - 1)
}

function getSpectralCentroid(ctx: AudioContext, samples: Float32Array): number {
  const fftSize = 2048
  const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
  buffer.getChannelData(0).set(samples)
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const an = ctx.createAnalyser()
  an.fftSize = fftSize
  an.smoothingTimeConstant = 0
  src.connect(an)
  const data = new Uint8Array(an.frequencyBinCount)
  an.getByteFrequencyData(data)
  let num = 0, den = 0
  for (let i = 0; i < data.length; i++) {
    const f = (i * ctx.sampleRate) / fftSize
    num += f * data[i]
    den += data[i]
  }
  return den > 0 ? num / den : 0
}

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const start = useCallback(async () => {
    setError(null)
    try {
      // Release any previous stream so the browser doesn't block the next request
      if (streamRef.current) {
        releaseStream(streamRef.current)
        streamRef.current = null
        mediaRecorderRef.current = null
      }
      // Don't request exact sampleRate - some browsers/devices reject it and then block the mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
      recorder.start(100)
      setIsRecording(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Microphone access denied')
    }
  }, [])

  const stop = useCallback((): Promise<VoicePrint | null> => {
    return new Promise((resolve) => {
      const rec = mediaRecorderRef.current
      const stream = streamRef.current
      if (!rec || rec.state === 'inactive') {
        releaseStream(stream)
        streamRef.current = null
        mediaRecorderRef.current = null
        resolve(null)
        return
      }
      rec.onstop = async () => {
        releaseStream(stream)
        streamRef.current = null
        mediaRecorderRef.current = null
        setIsRecording(false)
        const blobs = chunksRef.current
        if (blobs.length === 0) {
          resolve(null)
          return
        }
        const blob = new Blob(blobs, { type: 'audio/webm' })
        const print = await blobToVoicePrint(blob)
        resolve(print)
      }
      rec.stop()
    })
  }, [])

  // Release mic when component unmounts (e.g. user navigates away) so the browser doesn't keep it locked
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        releaseStream(streamRef.current)
        streamRef.current = null
        mediaRecorderRef.current = null
      }
    }
  }, [])

  return { isRecording, error, start, stop }
}

async function blobToVoicePrint(blob: Blob): Promise<VoicePrint | null> {
  let ctx: AudioContext | null = null
  try {
    const arrayBuffer = await blob.arrayBuffer()
    ctx = new AudioContext()
    const buf = await ctx.decodeAudioData(arrayBuffer.slice(0))
    const ch = buf.getChannelData(0)
    const rms = getRms(ch)
    const zcr = getZcr(ch)
    const spectralCentroid = getSpectralCentroid(ctx, ch)
    return {
      rms,
      spectralCentroid,
      zcr,
      duration: buf.duration,
      sampleRate: buf.sampleRate,
      raw: Array.from(ch.subarray(0, Math.min(4096, ch.length))),
    }
  } catch {
    return null
  } finally {
    if (ctx) await ctx.close()
  }
}

export async function analyzeBlob(blob: Blob): Promise<VoicePrint | null> {
  return blobToVoicePrint(blob)
}
