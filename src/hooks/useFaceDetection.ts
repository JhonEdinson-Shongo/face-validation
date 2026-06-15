import { useEffect, useRef, useState } from 'react'
import { FaceLandmarker, FilesetResolver, DrawingUtils, type NormalizedLandmark } from '@mediapipe/tasks-vision'
import { detectGestures } from '../utils/gestures'
import type { GestureType, GestureResult } from '../types'

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

const LANDMARK_COLOR = '#00ff88'
const EYE_COLOR = '#ff4444'
const LIPS_COLOR = '#ffaa00'

const OVAL_W = 0.36
const OVAL_H = OVAL_W * (4 / 3)
const FACE_CHECK_POINTS = [1, 10, 152, 234, 454, 468, 473]
const FACE_CENTER_POINTS = [1, 10, 152]

export const OVAL_THRESHOLD_INSIDE = 1
export const OVAL_THRESHOLD_FILL = 0.6

function calcOvalScore(landmarks: NormalizedLandmark[], points: number[]): number {
  const rx = OVAL_W / 2
  const ry = OVAL_H / 2
  let insideCount = 0
  for (const idx of points) {
    const lm = landmarks[idx]
    const dx = (lm.x - 0.5) / rx
    const dy = (lm.y - 0.5) / ry
    if (dx * dx + dy * dy <= 1) insideCount++
  }
  return insideCount / points.length
}

function calcFaceFillRatio(landmarks: NormalizedLandmark[]): number {
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]
  const faceWidth = Math.abs(rightCheek.x - leftCheek.x)
  const forehead = landmarks[10]
  const chin = landmarks[152]
  const faceHeight = Math.abs(chin.y - forehead.y)
  return Math.min(faceWidth / OVAL_W, faceHeight / OVAL_H)
}

function computeHeadPose(faceLm: NormalizedLandmark[]) {
  const nose = faceLm[1]
  const leftContour = faceLm[234]
  const rightContour = faceLm[454]
  const forehead = faceLm[10]
  const chin = faceLm[152]

  const faceCenterX = (leftContour.x + rightContour.x) / 2
  const faceWidth = Math.abs(leftContour.x - rightContour.x)
  const yawDeg = faceWidth > 0 ? -((nose.x - faceCenterX) / faceWidth) * 180 : 0

  const faceCenterY = (forehead.y + chin.y) / 2
  const faceHeight = Math.abs(chin.y - forehead.y)
  const pitchDeg = faceHeight > 0 ? -((nose.y - faceCenterY) / faceHeight) * 180 : 0

  return { yawDeg, pitchDeg, rollDeg: 0 }
}

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enabled: boolean,
) {
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [landmarks, setLandmarks] = useState<true | null>(null)
  const [gestures, setGestures] = useState<Record<GestureType, GestureResult> | null>(null)
  const [nosePosition, setNosePosition] = useState<{ x: number; y: number } | null>(null)
  const [ovalScore, setOvalScore] = useState<number | null>(null)
  const [ovalScoreCenter, setOvalScoreCenter] = useState<number | null>(null)
  const [faceFillRatio, setFaceFillRatio] = useState<number | null>(null)
  const landmarkerRef = useRef<FaceLandmarker | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    async function initMediaPipe() {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH)
        if (cancelled) return
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: 'GPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        })
        if (cancelled) {
          landmarker.close()
          return
        }
        landmarkerRef.current = landmarker
        setModelsLoaded(true)
      } catch (err) {
        console.error('Error initializing MediaPipe Face Landmarker:', err)
      }
    }

    initMediaPipe()
    return () => {
      cancelled = true
      landmarkerRef.current?.close()
    }
  }, [])

  useEffect(() => {
    if (!enabled || !modelsLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !landmarkerRef.current || !canvas) return

    const ctx = canvas.getContext('2d')!
    const landmarker = landmarkerRef.current

    function detect() {
      if (!video || video.paused || video.ended) {
        frameRef.current = requestAnimationFrame(detect)
        return
      }

      const timestamp = performance.now()
      const result = landmarker.detectForVideo(video, timestamp)

      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      if (result.faceLandmarks.length > 0) {
        const faceLm = result.faceLandmarks[0]
        const blendshapes = result.faceBlendshapes.length > 0 ? result.faceBlendshapes[0].categories : null

        const drawUtils = new DrawingUtils(ctx)

        drawUtils.drawConnectors(faceLm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
          color: LANDMARK_COLOR,
          lineWidth: 1,
        })
        drawUtils.drawConnectors(faceLm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
          color: EYE_COLOR,
          lineWidth: 1,
        })
        drawUtils.drawConnectors(faceLm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
          color: EYE_COLOR,
          lineWidth: 1,
        })
        drawUtils.drawConnectors(faceLm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
          color: LANDMARK_COLOR,
          lineWidth: 1,
        })
        drawUtils.drawConnectors(faceLm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
          color: LANDMARK_COLOR,
          lineWidth: 1,
        })
        drawUtils.drawConnectors(faceLm, FaceLandmarker.FACE_LANDMARKS_LIPS, {
          color: LIPS_COLOR,
          lineWidth: 1,
        })

        const bs: Record<string, number> = {}
        if (blendshapes) {
          for (const cat of blendshapes) {
            bs[cat.categoryName] = cat.score
          }
        }

        const headPose = computeHeadPose(faceLm)
        setNosePosition({ x: faceLm[1].x, y: faceLm[1].y })
        setOvalScore(calcOvalScore(faceLm, FACE_CHECK_POINTS))
        setOvalScoreCenter(calcOvalScore(faceLm, FACE_CENTER_POINTS))
        setFaceFillRatio(calcFaceFillRatio(faceLm))

        const currentGestures = detectGestures(blendshapes ? bs : null, headPose)
        setGestures(currentGestures)
        setLandmarks(true)

        const activeGestures = Object.entries(currentGestures)
          .filter(([, v]) => v.active)
          .map(([k]) => k)

        ctx.fillStyle = '#ffffff'
        ctx.font = '14px monospace'
        ctx.fillText(`Landmarks: ${faceLm.length} pts`, 12, 24)

        if (activeGestures.length > 0) {
          ctx.fillStyle = '#ffcc00'
          ctx.font = '14px sans-serif'
          ctx.fillText(`Gestos: ${activeGestures.join(', ')}`, 12, 44)
        } else {
          ctx.fillStyle = '#ffcc00'
          ctx.font = '14px sans-serif'
          ctx.fillText('Sin gesto activo', 12, 44)
        }

        if (blendshapes) {
          const leftBlink = bs.eyeBlinkLeft ?? 0
          const rightBlink = bs.eyeBlinkRight ?? 0
          const browAvg =
            ((bs.browInnerUp ?? 0) + (bs.browOuterUpLeft ?? 0) + (bs.browOuterUpRight ?? 0)) / 3

          ctx.fillStyle = '#aaaaaa'
          ctx.font = '11px monospace'
          ctx.fillText(`BL: ${(leftBlink * 100).toFixed(0)}% BR: ${(rightBlink * 100).toFixed(0)}%`, 12, 64)
          ctx.fillText(`Cejas: ${(browAvg * 100).toFixed(0)}%`, 12, 78)
          ctx.fillText(`Yaw: ${headPose.yawDeg.toFixed(1)}°  Pitch: ${headPose.pitchDeg.toFixed(1)}°`, 12, 92)
        }
      } else {
        setGestures(null)
        setLandmarks(null)
        setNosePosition(null)
        setOvalScore(null)
        setOvalScoreCenter(null)
        setFaceFillRatio(null)

        ctx.fillStyle = '#ff6666'
        ctx.font = '16px sans-serif'
        ctx.fillText('Sin rostro detectado', 16, 30)
      }

      frameRef.current = requestAnimationFrame(detect)
    }

    frameRef.current = requestAnimationFrame(detect)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)
    }
  }, [enabled, modelsLoaded, videoRef, canvasRef])

  return { modelsLoaded, landmarks, gestures, nosePosition, ovalScore, ovalScoreCenter, faceFillRatio }
}
