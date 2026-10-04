import { useEffect, useRef, useCallback, useState } from 'react'
import { useStore, CAPTURE_COUNTDOWN_SECONDS, TOTAL_PHOTOS } from '../../stores/validationStore'
import { VideoFeed } from '../webcam/VideoFeed'
import { ChallengeStepper } from './ChallengeStepper'
import { CaptureStatus } from './CaptureStatus'
import { PhotoGrid } from './PhotoGrid'
import { GestureInstruction } from './GestureInstruction'
import { SteadyFaceMask, type OvalCategory } from './SteadyFaceMask'
import { useWebcam } from '../webcam/useWebcam'
import { useFaceDetection, CONTAINMENT_MIN, CONTAINMENT_CENTER_MIN, FILL_MIN, FILL_MAX } from '../../hooks/useFaceDetection'

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
  const { modelsLoaded, modelError, retryModels, landmarks, gestures, containment, containmentCenter, fillRatio } = useFaceDetection(videoRef, canvasRef, enabled)
  const headTurnGestures = new Set(['face-left', 'face-right'])
  const curGestureType = combination && currentStep >= 0 && currentStep < combination.steps.length
    ? combination.steps[currentStep]
    : null
  const isHeadTurnStep = curGestureType !== null && headTurnGestures.has(curGestureType)
  // Alineación: % de landmarks dentro del óvalo (núcleo en giros).
  const containmentValue = isHeadTurnStep ? containmentCenter : containment
  const containmentLimit = isHeadTurnStep ? CONTAINMENT_CENTER_MIN : CONTAINMENT_MIN
  const aligned = containmentValue !== null && containmentValue >= containmentLimit
  // Distancia: % del área del óvalo cubierta por el rostro.
  // En giros se ignora: el giro reduce el ancho aparente y falsearía el "acércate".
  let ovalCategory: OvalCategory
  if (!aligned) ovalCategory = 'outside'
  else if (!isHeadTurnStep && fillRatio !== null && fillRatio < FILL_MIN) ovalCategory = 'too-far'
  else if (!isHeadTurnStep && fillRatio !== null && fillRatio > FILL_MAX) ovalCategory = 'too-close'
  else ovalCategory = 'good'
  // Histéresis: el jitter genera frames sueltos "outside" (6 frames para confirmar).
  // La distancia cambia lento: too-far/too-close reaccionan de inmediato.
  const [stableNoOval, setStableNoOval] = useState(false)
  const outsideFramesRef = useRef(0)
  const OUTSIDE_FRAMES_TO_CONFIRM = 6
  useEffect(() => {
    if (ovalCategory === 'outside') {
      outsideFramesRef.current += 1
      if (outsideFramesRef.current >= OUTSIDE_FRAMES_TO_CONFIRM) setStableNoOval(true)
    } else if (ovalCategory === 'good') {
      outsideFramesRef.current = 0
      setStableNoOval(false)
    } else {
      outsideFramesRef.current = 0
      setStableNoOval(true)
    }
  }, [ovalCategory, containmentValue, fillRatio])
  const noOval = stableNoOval

  const prevActiveRef = useRef<Record<number, boolean>>({})
  const completedRef = useRef<Set<number>>(new Set())
  const cancelRef = useRef(false)
  const restartTriggeredRef = useRef(false)
  // Anti-rebote: el gesto debe mantenerse activo este tiempo para validarse.
  const GESTURE_HOLD_MS = 300
  const holdStartRef = useRef<Record<number, number>>({})
  const simultaneousHoldStartRef = useRef(0)

  const CAPTURE_PHOTOS = TOTAL_PHOTOS - 1
  const captureActive = countdown !== null || capturing
  let steadyPhase: 'gestures' | 'countdown' | 'capturing'
  if (countdown !== null) steadyPhase = 'countdown'
  else if (capturing) steadyPhase = 'capturing'
  else steadyPhase = 'gestures'
  const photoIndex = capturing ? Math.max(0, photos.length - 1) : 0
  const totalPhotos = TOTAL_PHOTOS

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
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return null
    const c = document.createElement('canvas')
    c.width = video.videoWidth
    c.height = video.videoHeight
    const ctx = c.getContext('2d')!
    // La vista previa se muestra espejada: replicarlo para que la foto coincida.
    ctx.translate(c.width, 0)
    ctx.scale(-1, 1)
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

  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const restartValidation = useCallback((message = 'Rostro fuera del marco. Vuelve a empezar.') => {
    if (restartTriggeredRef.current) return
    restartTriggeredRef.current = true
    cancelRef.current = true
    setCapturing(false)
    setCountdown(null)
    setCurrentStep(-1)
    setStepStartTime(0)
    setCompletedSteps([])
    prevActiveRef.current = {}
    completedRef.current = new Set()
    holdStartRef.current = {}
    simultaneousHoldStartRef.current = 0
    setRestartMessage(message)
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    restartTimerRef.current = setTimeout(() => setRestartMessage(null), 2500)
  }, [setCountdown, setCurrentStep, setStepStartTime, setCompletedSteps, setCapturing])

  useEffect(() => {
    if (countdown !== null && noOval && !restartTriggeredRef.current) {
      restartValidation()
    }
    if (capturing && noOval && !restartTriggeredRef.current) {
      restartValidation('Rostro fuera del marco. Captura cancelada.')
    }
    if (noOval && countdown === null && !capturing) {
      prevActiveRef.current = {}
      completedRef.current = new Set()
      holdStartRef.current = {}
      simultaneousHoldStartRef.current = 0
    }
    if (!noOval) {
      restartTriggeredRef.current = false
    }
  }, [countdown, capturing, noOval, restartValidation])

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      if (noOval) {
        restartValidation()
        return
      }
      setCountdown(null)
      triggerCapture()
      return
    }
    const id = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown, noOval, triggerCapture, restartValidation, setCountdown])

  useEffect(() => {
    return () => {
      cancelRef.current = true
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!enabled || !landmarks || !combination || capturing || !gestures || done || countdown !== null || noOval) return

    if (combination.mode === 'simultaneous') {
      // Sin latch: refleja solo los gestos activos ahora mismo.
      const activeSteps = combination.steps
        .map((g, i) => (gestures[g].active ? i : -1))
        .filter((i) => i >= 0)
      const prev = completedRef.current
      const changed = activeSteps.length !== prev.size || activeSteps.some((i) => !prev.has(i))
      if (changed) {
        completedRef.current = new Set(activeSteps)
        setCompletedSteps(activeSteps)
      }

      const allActive = activeSteps.length === combination.steps.length
      if (!allActive) {
        simultaneousHoldStartRef.current = 0
        return
      }
      if (!simultaneousHoldStartRef.current) simultaneousHoldStartRef.current = Date.now()
      if (Date.now() - simultaneousHoldStartRef.current >= GESTURE_HOLD_MS) {
        startCountdown()
      }
      return
    }

    const stepIdx = currentStep < 0 ? 0 : currentStep
    if (stepIdx >= combination.steps.length) return

    const gesture = combination.steps[stepIdx]
    const isActive = gestures[gesture]?.active ?? false

    const elapsed = Date.now() - stepStartTime

    if (currentStep > 0 && elapsed > combination.captureDelay) {
      setCurrentStep(-1)
      setStepStartTime(0)
      prevActiveRef.current = {}
      holdStartRef.current = {}
      return
    }

    if (!isActive) {
      holdStartRef.current[stepIdx] = 0
      prevActiveRef.current[stepIdx] = false
      return
    }
    if (!holdStartRef.current[stepIdx]) holdStartRef.current[stepIdx] = Date.now()
    const held = Date.now() - holdStartRef.current[stepIdx] >= GESTURE_HOLD_MS
    const alreadyFired = prevActiveRef.current[stepIdx] ?? false
    if (!held || alreadyFired) return
    prevActiveRef.current[stepIdx] = true

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

      {!modelsLoaded && !modelError && (
        <div className="status-loading">
          <div className="spinner" />
          <p>Cargando modelos de detección facial...</p>
        </div>
      )}

      {modelError && (
        <div className="error-view">
          <p className="error-message">{modelError}</p>
          <div className="validation-actions">
            <button className="btn btn-primary" onClick={retryModels}>
              Reintentar
            </button>
            <button className="btn btn-secondary" onClick={backToCatalog}>
              Volver al catálogo
            </button>
          </div>
        </div>
      )}

      {restartMessage ? (
        <div className="restart-banner">{restartMessage}</div>
      ) : (
        noOval && enabled && !done && (
          <div className="restart-banner">Vuelve al centro del óvalo</div>
        )
      )}

      {modelsLoaded && (
        <>
          <ChallengeStepper />
          <VideoFeed videoRef={videoRef} canvasRef={canvasRef} active={enabled && !capturing}>
            {!captureActive && combination && !done && !capturing && (
              combination.mode === 'simultaneous' ? (
                <div className="gesture-instruction-group">
                  {combination.steps.map((g) => (
                    <GestureInstruction key={g} gesture={g} active={!!gestures?.[g]?.active} />
                  ))}
                </div>
              ) : (
                currentGesture && (
                  <GestureInstruction gesture={currentGesture} active={!!isGestureActive} />
                )
              )
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
