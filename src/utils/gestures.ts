import * as faceapi from 'face-api.js'
import { calculateEAR } from './ear'
import type { GestureType, GestureResult } from '../types'

const EYES_CLOSED_THRESHOLD = 0.25
const BROW_RAISE_RATIO = 0.24
const FACE_TURN_RATIO = 0.22
const LOOK_UP_THRESHOLD = 0.16
const LOOK_DOWN_THRESHOLD = 0.34

function midpoint(pts: faceapi.Point[]): faceapi.Point {
  const x = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const y = pts.reduce((s, p) => s + p.y, 0) / pts.length
  return new faceapi.Point(x, y)
}

function dist(a: faceapi.Point, b: faceapi.Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function eyesClosed(landmarks: faceapi.FaceLandmarks68): GestureResult {
  const left = landmarks.getLeftEye()
  const right = landmarks.getRightEye()
  const ear = (calculateEAR(left) + calculateEAR(right)) / 2
  return {
    active: ear < EYES_CLOSED_THRESHOLD,
    confidence: Math.max(0, Math.min(1, (EYES_CLOSED_THRESHOLD - ear) / EYES_CLOSED_THRESHOLD)),
  }
}

function eyebrowsRaised(landmarks: faceapi.FaceLandmarks68): GestureResult {
  const pts = landmarks.positions
  const leftBrow = midpoint(pts.slice(17, 22))
  const rightBrow = midpoint(pts.slice(22, 27))
  const leftEye = midpoint(pts.slice(36, 42))
  const rightEye = midpoint(pts.slice(42, 48))

  const browY = (leftBrow.y + rightBrow.y) / 2
  const eyeY = (leftEye.y + rightEye.y) / 2
  const faceHeight = pts[8].y - pts[27].y

  const ratio = (eyeY - browY) / faceHeight
  const threshold = BROW_RAISE_RATIO

  return {
    active: ratio > threshold,
    confidence: Math.max(0, Math.min(1, (ratio - threshold) / threshold)),
  }
}

function faceLeft(landmarks: faceapi.FaceLandmarks68): GestureResult {
  const pts = landmarks.positions
  const nose = pts[30]
  const left = pts[0].x
  const right = pts[16].x
  const faceWidth = right - left
  const center = (left + right) / 2
  const offset = (center - nose.x) / faceWidth

  return {
    active: offset > FACE_TURN_RATIO,
    confidence: Math.max(0, Math.min(1, (offset - FACE_TURN_RATIO) / (0.5 - FACE_TURN_RATIO))),
  }
}

function faceRight(landmarks: faceapi.FaceLandmarks68): GestureResult {
  const pts = landmarks.positions
  const nose = pts[30]
  const left = pts[0].x
  const right = pts[16].x
  const faceWidth = right - left
  const center = (left + right) / 2
  const offset = (nose.x - center) / faceWidth

  return {
    active: offset > FACE_TURN_RATIO,
    confidence: Math.max(0, Math.min(1, (offset - FACE_TURN_RATIO) / (0.5 - FACE_TURN_RATIO))),
  }
}

function lookUp(landmarks: faceapi.FaceLandmarks68): GestureResult {
  const pts = landmarks.positions
  const noseBridge = pts[27]
  const noseTip = pts[30]
  const chin = pts[8]
  const faceHeight = chin.y - noseBridge.y
  const noseVector = (noseTip.y - noseBridge.y) / faceHeight

  return {
    active: noseVector < LOOK_UP_THRESHOLD,
    confidence: Math.max(0, Math.min(1, (LOOK_UP_THRESHOLD - noseVector) / LOOK_UP_THRESHOLD)),
  }
}

function lookDown(landmarks: faceapi.FaceLandmarks68): GestureResult {
  const pts = landmarks.positions
  const noseBridge = pts[27]
  const noseTip = pts[30]
  const chin = pts[8]
  const faceHeight = chin.y - noseBridge.y
  const noseVector = (noseTip.y - noseBridge.y) / faceHeight

  return {
    active: noseVector > LOOK_DOWN_THRESHOLD,
    confidence: Math.max(0, Math.min(1, (noseVector - LOOK_DOWN_THRESHOLD) / LOOK_DOWN_THRESHOLD)),
  }
}

const DETECTORS: Record<GestureType, (lm: faceapi.FaceLandmarks68) => GestureResult> = {
  'eyes-closed': eyesClosed,
  'eyebrows-raised': eyebrowsRaised,
  'face-left': faceLeft,
  'face-right': faceRight,
  'look-up': lookUp,
  'look-down': lookDown,
}

export function detectGestures(landmarks: faceapi.FaceLandmarks68): Record<GestureType, GestureResult> {
  const result = {} as Record<GestureType, GestureResult>
  for (const key of Object.keys(DETECTORS) as GestureType[]) {
    result[key] = DETECTORS[key](landmarks)
  }
  return result
}
