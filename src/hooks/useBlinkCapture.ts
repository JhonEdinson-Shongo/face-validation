import { useState, useRef, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'
import { calculateEAR } from '../utils/ear'
import type { AppStatus } from '../types'

const EAR_THRESHOLD = 0.25
const CONSECUTIVE_FRAMES = 1
const CAPTURE_INTERVAL = 1000
const BLINK_COOLDOWN = 2000

export function useBlinkCapture(
  landmarks: faceapi.FaceLandmarks68 | null,
  videoRef: React.RefObject<HTMLVideoElement>,
  modelsLoaded: boolean,
) {
  const [status, setStatus] = useState<AppStatus>('idle')
  const [photos, setPhotos] = useState<string[]>([])
  const [counter, setCounter] = useState(0)

  const blinkCounterRef = useRef(0)
  const lastBlinkRef = useRef(0)
  const capturingRef = useRef(false)

  useEffect(() => {
    if (modelsLoaded && (status === 'idle' || status === 'loading')) {
      setStatus('ready')
    }
  }, [modelsLoaded, status])

  useEffect(() => {
    if (status !== 'watching' || !landmarks) {
      blinkCounterRef.current = 0
      return
    }

    const now = Date.now()
    if (now - lastBlinkRef.current < BLINK_COOLDOWN || capturingRef.current) return

    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()

    const ear = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2

    if (ear < EAR_THRESHOLD) {
      blinkCounterRef.current += 1
      if (blinkCounterRef.current >= CONSECUTIVE_FRAMES) {
        lastBlinkRef.current = now
        blinkCounterRef.current = 0
        triggerCapture()
      }
    } else {
      blinkCounterRef.current = 0
    }
  }, [status, landmarks])

  function captureFrame(): string | null {
    const video = videoRef.current
    if (!video) return null

    const c = document.createElement('canvas')
    c.width = video.videoWidth
    c.height = video.videoHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    return c.toDataURL('image/jpeg', 0.9)
  }

  async function triggerCapture() {
    if (capturingRef.current) return
    capturingRef.current = true

    setPhotos([])
    setCounter(3)
    setStatus('capturing')

    for (let i = 0; i < 4; i++) {
      const dataUrl = captureFrame()
      if (dataUrl) {
        setPhotos((prev) => [...prev, dataUrl])
      }
      setCounter(3 - i)
      if (i < 3) {
        await new Promise((r) => setTimeout(r, CAPTURE_INTERVAL))
      }
    }

    capturingRef.current = false
    setStatus('complete')
  }

  const start = useCallback(() => {
    setStatus('watching')
    setPhotos([])
    setCounter(0)
    blinkCounterRef.current = 0
  }, [])

  const reset = useCallback(() => {
    setStatus('ready')
    setPhotos([])
    setCounter(0)
    blinkCounterRef.current = 0
    capturingRef.current = false
  }, [])

  return { status, photos, counter, start, reset }
}
