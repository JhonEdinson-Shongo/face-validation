import { useEffect, useRef, useCallback, useState } from 'react'
import { useStore, CAPTURE_COUNTDOWN_SECONDS } from '../../stores/validationStore'
import { VideoFeed } from '../webcam/VideoFeed'
import { ChallengeStepper } from './ChallengeStepper'
import { CaptureStatus } from './CaptureStatus'
import { PhotoGrid } from './PhotoGrid'
import { GestureInstruction } from './GestureInstruction'
import { SteadyFaceMask } from './SteadyFaceMask'
import { useWebcam } from '../webcam/useWebcam'
import { useFaceDetection, OVAL_THRESHOLD_INSIDE, OVAL_THRESHOLD_FILL } from '../../hooks/useFaceDetection'

export function ValidationView() {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const combination = useStore((s) => s.combination)
  const enabled = useStore((s) => s.enabled)
  const capturing = useStore((s) => s.capturing)
  const done = useStore((s) => s.done)
  const photos = useStore((s) => s.photos)
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

  const [restartMessage, setRestartMessage] = useState<string | null>(null)

  const { videoRef, error } = useWebcam()
  const { modelsLoaded, landmarks, gestures, ovalScore, ovalScoreCenter, faceFillRatio } = useFaceDetection(videoRef, canvasRef, enabled)
  const headTurnGestures = new Set(['face-left', 'face-right'])
  const curGestureType = combination && currentStep >= 0 && currentStep < combination.steps.length
    ? combination.steps[currentStep]
    : null
  const isHeadTurnStep = curGestureType !== null && headTurnGestures.has(curGestureType)
  const effectiveScore = isHeadTurnStep ? ovalScoreCenter : ovalScore
  const faceInsideOval = effectiveScore !== null && effectiveScore >= OVAL_THRESHOLD_INSIDE
  const ovalCategory = effectiveScore === null || effectiveScore < OVAL_THRESHOLD_INSIDE ? 'outside' as const
    : faceFillRatio !== null && faceFillRatio >= OVAL_THRESHOLD_FILL ? 'good' as const
      : 'partial' as const
  const noOval = ovalCategory !== 'good'

  const prevActiveRef = useRef<Record<number, boolean>>({})
  const completedRef = useRef<Set<number>>(new Set())
  const cancelRef = useRef(false)
  const restartTriggeredRef = useRef(false)

  const CAPTURE_PHOTOS = 3
  const captureActive = countdown !== null || capturing
  let steadyPhase: 'gestures' | 'countdown' | 'capturing'
  if (countdown !== null) steadyPhase = 'countdown'
  else if (capturing) steadyPhase = 'capturing'
  else steadyPhase = 'gestures'
  const photoIndex = capturing ? Math.max(0, photos.length - 1) : 0
  const totalPhotos = CAPTURE_PHOTOS

  const currentGesture = combination && !done && !capturing && !captureActive
    ? combination.steps[currentStep >= 0 ? currentStep : 0]
    : null

  const isGestureActive = currentGesture && gestures?.[currentGesture]?.active

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
      for (let i = 0; i < CAPTURE_PHOTOS; i++) {
        if (cancelRef.current) break
        if (i > 0) {
          await new Promise((r) => setTimeout(r, 700))
        }
        const dataUrl = captureFrame()
        if (dataUrl) {
          addPhoto(dataUrl)
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
    setCountdown(CAPTURE_COUNTDOWN_SECONDS)
  }, [setCountdown, captureFrame, addPhoto])

  const restartValidation = useCallback(() => {
    if (restartTriggeredRef.current) return
    restartTriggeredRef.current = true
    setCountdown(null)
    setCurrentStep(-1)
    setStepStartTime(0)
    setCompletedSteps([])
    prevActiveRef.current = {}
    completedRef.current = new Set()
    setRestartMessage('Rostro fuera del marco. Vuelve a empezar.')
    setTimeout(() => setRestartMessage(null), 2500)
  }, [setCountdown, setCurrentStep, setStepStartTime, setCompletedSteps])

  useEffect(() => {
    if (countdown !== null && noOval && !restartTriggeredRef.current) {
      restartValidation()
    }
    if (noOval && countdown === null) {
      prevActiveRef.current = {}
      completedRef.current = new Set()
    }
    if (!noOval) {
      restartTriggeredRef.current = false
    }
  }, [countdown, noOval, restartValidation])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
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
    if (!enabled || !landmarks || !combination || capturing || !gestures || done || countdown !== null || noOval) return

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
    landmarks, enabled, combination, capturing, gestures, noOval,
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

      {restartMessage && (
        <div className="restart-banner">{restartMessage}</div>
      )}

      {modelsLoaded && (
        <>
          <ChallengeStepper />
          <VideoFeed videoRef={videoRef} canvasRef={canvasRef} active={enabled && !capturing}>
            {currentGesture && !captureActive && (
              <GestureInstruction gesture={currentGesture} active={!!isGestureActive} />
            )}
            <SteadyFaceMask
              phase={steadyPhase}
              countdownValue={countdown ?? 0}
              photoIndex={photoIndex}
              totalPhotos={totalPhotos}
              ovalCategory={ovalCategory}
            />
          </VideoFeed>
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
