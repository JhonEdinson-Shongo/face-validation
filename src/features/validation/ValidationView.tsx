import { useEffect, useRef, useCallback } from 'react'
import { useStore, CAPTURE_COUNTDOWN_SECONDS } from '../../stores/validationStore'
import { VideoFeed } from '../webcam/VideoFeed'
import { ChallengeStepper } from './ChallengeStepper'
import { CaptureStatus } from './CaptureStatus'
import { PhotoGrid } from './PhotoGrid'
import { useWebcam } from '../webcam/useWebcam'
import { useFaceDetection } from '../../hooks/useFaceDetection'

export function ValidationView() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const combination = useStore((s) => s.combination)
  const enabled = useStore((s) => s.enabled)
  const capturing = useStore((s) => s.capturing)
  const done = useStore((s) => s.done)
  const currentStep = useStore((s) => s.currentStep)
  const stepStartTime = useStore((s) => s.stepStartTime)
  const setEnabled = useStore((s) => s.setEnabled)
  const setCapturing = useStore((s) => s.setCapturing)
  const setDone = useStore((s) => s.setDone)
  const setCurrentStep = useStore((s) => s.setCurrentStep)
  const setStepStartTime = useStore((s) => s.setStepStartTime)
  const setCompletedSteps = useStore((s) => s.setCompletedSteps)
  const addPhoto = useStore((s) => s.addPhoto)
  const countdown = useStore((s) => s.countdown)
  const setCountdown = useStore((s) => s.setCountdown)
  const backToCatalog = useStore((s) => s.backToCatalog)

  const { videoRef, error } = useWebcam()
  const { modelsLoaded, landmarks, gestures } = useFaceDetection(videoRef, canvasRef, enabled)

  const prevActiveRef = useRef<Record<number, boolean>>({})
  const completedRef = useRef<Set<number>>(new Set())
  const cancelRef = useRef(false)

  useEffect(() => {
    if (modelsLoaded && !enabled && !done) {
      setEnabled(true)
    }
  }, [modelsLoaded, enabled, done, setEnabled])

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current
    if (!video) return null
    const c = document.createElement('canvas')
    c.width = video.videoWidth
    c.height = video.videoHeight
    const ctx = c.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    return c.toDataURL('image/jpeg', 0.9)
  }, [videoRef])

  const triggerCapture = useCallback(() => {
    if (capturing) return
    setCapturing(true)
    cancelRef.current = false

    void (async () => {
      for (let i = 0; i < 3; i++) {
        if (cancelRef.current) break
        const dataUrl = captureFrame()
        if (dataUrl) {
          addPhoto(dataUrl)
        }
        if (i < 2) {
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
      if (!cancelRef.current) {
        setCapturing(false)
        setEnabled(false)
        setDone(true)
      }
    })()
  }, [capturing, setCapturing, captureFrame, addPhoto, setEnabled, setDone])

  const startCountdown = useCallback(() => {
    const dataUrl = captureFrame()
    if (dataUrl) {
      addPhoto(dataUrl)
    }
    setCountdown(-1)
  }, [captureFrame, addPhoto, setCountdown])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === -1) {
      const id = setTimeout(() => setCountdown(CAPTURE_COUNTDOWN_SECONDS), 1000)
      return () => clearTimeout(id)
    }
    if (countdown === 1) {
      setCountdown(null)
      triggerCapture()
      return
    }
    const id = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown, triggerCapture, setCountdown])

  useEffect(() => {
    return () => { cancelRef.current = true }
  }, [])

  useEffect(() => {
    if (!enabled || !landmarks || !combination || capturing || !gestures || done || countdown !== null) return

    if (combination.mode === 'simultaneous') {
      const prevSize = completedRef.current.size
      for (const [i, g] of combination.steps.entries()) {
        if (gestures[g].active) completedRef.current.add(i)
      }
      if (completedRef.current.size !== prevSize) {
        setCompletedSteps(Array.from(completedRef.current))
      }

      const allActive = combination.steps.every((g) => gestures[g].active)
      if (allActive) {
        startCountdown()
      }
      return
    }

    const stepIdx = currentStep < 0 ? 0 : currentStep
    if (stepIdx >= combination.steps.length) return

    const gesture = combination.steps[stepIdx]
    const isActive = gestures[gesture]?.active ?? false
    const wasActive = prevActiveRef.current[stepIdx] ?? false
    const risingEdge = !wasActive && isActive
    prevActiveRef.current[stepIdx] = isActive

    const elapsed = Date.now() - stepStartTime

    if (currentStep > 0 && elapsed > combination.captureDelay) {
      setCurrentStep(-1)
      setStepStartTime(0)
      prevActiveRef.current = {}
      return
    }

    if (!risingEdge) return

    if (stepIdx === combination.steps.length - 1) {
      startCountdown()
    } else {
      setCurrentStep(stepIdx + 1)
      setStepStartTime(Date.now())
    }
  }, [
    landmarks, enabled, combination, capturing, gestures,
    currentStep, stepStartTime, done, countdown,
    triggerCapture, startCountdown, setCurrentStep, setStepStartTime, setCompletedSteps,
  ])

  if (error) {
    return (
      <div className="error-view">
        <p className="error-message">{error}</p>
        <p className="error-hint">Asegúrate de permitir el acceso a la cámara</p>
        <button className="btn btn-secondary" onClick={backToCatalog}>
          Volver al catálogo
        </button>
      </div>
    )
  }

  return (
    <main className="validation-view">
      <nav className="validation-nav">
        <button className="btn-icon" onClick={backToCatalog} title="Volver al catálogo">
          ←
        </button>
        <span className="nav-title">{combination?.name ?? 'Validación'}</span>
        <div />
      </nav>

      {!modelsLoaded && (
        <div className="status-loading">
          <div className="spinner" />
          <p>Cargando modelos de detección facial...</p>
        </div>
      )}

      {modelsLoaded && (
        <>
          <ChallengeStepper />
          <VideoFeed videoRef={videoRef} canvasRef={canvasRef} active={enabled} />
          <CaptureStatus />

          {done && (
            <div className="validation-actions">
              <PhotoGrid />
              <button className="btn btn-primary" onClick={backToCatalog}>
                Nueva validación
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
