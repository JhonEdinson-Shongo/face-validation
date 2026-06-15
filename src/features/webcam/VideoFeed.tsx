import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement>
  canvasRef: React.RefObject<HTMLCanvasElement>
  active: boolean
  children?: ReactNode
}

export function VideoFeed({ videoRef, canvasRef, active, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function syncSize() {
      const rect = container.getBoundingClientRect()
      const cvs = canvasRef.current
      if (cvs) {
        cvs.width = rect.width
        cvs.height = rect.height
      }
    }

    syncSize()
    window.addEventListener('resize', syncSize)
    return () => window.removeEventListener('resize', syncSize)
  }, [canvasRef])

  return (
    <div className="video-container" ref={containerRef}>
      <video
        ref={videoRef}
        className="video-feed"
        autoPlay
        playsInline
        muted
      />
      {active && (
        <canvas
          ref={canvasRef}
          className="canvas-overlay"
        />
      )}
      {children}
    </div>
  )
}
