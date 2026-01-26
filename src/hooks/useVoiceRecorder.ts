import { useState, useCallback, useRef } from 'react'
import type { VoicePrint } from '../types'

const SAMPLE_RATE = 44100

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: SAMPLE_RATE } })
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
        stream?.getTracks().forEach((t) => t.stop())
        resolve(null)
        return
      }
      rec.onstop = async () => {
        stream?.getTracks().forEach((t) => t.stop())
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

  return { isRecording, error, start, stop }
}

async function blobToVoicePrint(blob: Blob): Promise<VoicePrint | null> {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
    const buf = await ctx.decodeAudioData(arrayBuffer.slice(0))
    const ch = buf.getChannelData(0)
    const rms = getRms(ch)
    const zcr = getZcr(ch)
    const spectralCentroid = getSpectralCentroid(ctx, ch)
    await ctx.close()
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
  }
}

export async function analyzeBlob(blob: Blob): Promise<VoicePrint | null> {
  return blobToVoicePrint(blob)
}
