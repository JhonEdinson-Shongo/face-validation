import { useEffect, useRef, useState } from 'react'

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null!)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current && videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream
        }
      } catch {
        if (!cancelled) setError('No se pudo acceder a la cámara')
      }
    }

    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const stream = streamRef.current
    if (video && stream && video.srcObject !== stream) {
      video.srcObject = stream
    }
  })

  return { videoRef, error }
}
