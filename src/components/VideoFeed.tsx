import { type RefObject, useEffect, useRef } from 'react'

interface VideoFeedProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  active: boolean
}

export function VideoFeed({ videoRef, canvasRef, active }: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!video || !canvas || !container) return

    function syncSize() {
      const rect = container.getBoundingClientRect()
      canvas!.width = rect.width
      canvas!.height = rect.height
    }

    syncSize()
    window.addEventListener('resize', syncSize)
    return () => window.removeEventListener('resize', syncSize)
  }, [videoRef, canvasRef, active])

  return (
    <div ref={containerRef} className="video-container">
      <video ref={videoRef} className="video-feed" autoPlay muted playsInline />
      <canvas ref={canvasRef} className="canvas-overlay" />
    </div>
  )
}
