import React, { useRef } from 'react'
import { useWebcam } from '../hooks/useWebcam'
import { useFaceDetection } from '../hooks/useFaceDetection'
import { useBlinkCapture } from '../hooks/useBlinkCapture'
import { VideoFeed } from './VideoFeed'
import { StatusIndicator } from './StatusIndicator'
import { PhotoGrid } from './PhotoGrid'
import { Controls } from './Controls'

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const { videoRef, error } = useWebcam()
  const [enabled, setEnabled] = React.useState(false)

  const { modelsLoaded, landmarks, earValue } = useFaceDetection(videoRef, canvasRef, enabled)
  const { status, photos, counter, start, reset } = useBlinkCapture(
    landmarks,
    videoRef,
    modelsLoaded,
  )

  function handleStart() {
    setEnabled(true)
    start()
  }

  function handleReset() {
    reset()
    setEnabled(false)
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-message">
          <p>{error}</p>
          <p>Asegúrate de permitir el acceso a la cámara</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <h1 className="title">Face Validation</h1>

      <VideoFeed videoRef={videoRef} canvasRef={canvasRef} active={enabled} />
      <StatusIndicator status={status} counter={counter} earValue={earValue} />
      <PhotoGrid photos={photos} />
      <Controls status={status} onStart={handleStart} onReset={handleReset} />
    </div>
  )
}

