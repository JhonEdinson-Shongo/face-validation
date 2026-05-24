import { useRef, useEffect, useState } from 'react'

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null!)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setError('No se pudo acceder a la cámara')
      }
    }

    start()

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return { videoRef, error }
}
