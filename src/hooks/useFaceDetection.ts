import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'
import type { FaceLandmarks68 } from 'face-api.js'
import { calculateEAR } from '../utils/ear'

const MODEL_PATH = '/models'

const LANDMARK_COLOR = '#00ff88'
const BOX_COLOR = '#00ff88'
const EYE_LANDMARK_COLOR = '#ff4444'

export function useFaceDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enabled: boolean,
) {
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [landmarks, setLandmarks] = useState<FaceLandmarks68 | null>(null)
  const [earValue, setEarValue] = useState<number | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_PATH)
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_PATH)
        if (!cancelled) setModelsLoaded(true)
      } catch {
        console.error('Error loading face-api models')
      }
    }

    loadModels()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!enabled || !modelsLoaded) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')!

    async function detect() {
      if (video!.paused || video!.ended) {
        frameRef.current = requestAnimationFrame(detect)
        return
      }

      const result = await faceapi
        .detectSingleFace(video!, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
        .withFaceLandmarks()

      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      if (result) {
        const { detection, landmarks: lm } = result
        const dims = faceapi.matchDimensions(canvas!, video!, true)
        const resized = faceapi.resizeResults(result, dims)
        const resizedDetection = faceapi.resizeResults(detection, dims)

        const box = resizedDetection.box
        ctx.strokeStyle = BOX_COLOR
        ctx.lineWidth = 2
        ctx.strokeRect(box.x, box.y, box.width, box.height)

        const points = resized.landmarks.positions
        ctx.fillStyle = LANDMARK_COLOR
        for (const p of points) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }

        const eyeIndices = Array.from({ length: 12 }, (_, i) => i + 36)
        ctx.fillStyle = EYE_LANDMARK_COLOR
        for (const i of eyeIndices) {
          const p = points[i]
          if (p) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        const leftEye = lm.getLeftEye()
        const rightEye = lm.getRightEye()
        const ear = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2
        setEarValue(ear)

        ctx.fillStyle = '#ffffff'
        ctx.font = '14px monospace'
        ctx.fillText(`EAR: ${ear.toFixed(3)}`, box.x, box.y - 10)

        setLandmarks(lm)
      } else {
        setEarValue(null)
        setLandmarks(null)

        ctx.fillStyle = '#ff6666'
        ctx.font = '16px sans-serif'
        ctx.fillText('Sin rostro detectado', 16, 30)
      }

      frameRef.current = requestAnimationFrame(detect)
    }

    frameRef.current = requestAnimationFrame(detect)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [enabled, modelsLoaded, videoRef, canvasRef])

  return { modelsLoaded, landmarks, earValue }
}
