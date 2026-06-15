import type { GestureType, GestureResult } from '../types'

const BLINK_THRESHOLD = 0.6
const BROW_THRESHOLD = 0.4
const HEAD_TURN_DEG = 15
const HEAD_PITCH_DEG = 15

const MAX_YAW_DEG = 45
const MAX_PITCH_DEG = 30

export function detectGestures(
  blendshapes: Record<string, number> | null,
  headPose: { yawDeg: number; pitchDeg: number; rollDeg: number } | null,
): Record<GestureType, GestureResult> {
  const result = {} as Record<GestureType, GestureResult>

  const leftBlink = blendshapes?.eyeBlinkLeft ?? 0
  const rightBlink = blendshapes?.eyeBlinkRight ?? 0
  const blinkAvg = (leftBlink + rightBlink) / 2
  result['eyes-closed'] = {
    active: blinkAvg > BLINK_THRESHOLD,
    confidence: Math.max(0, Math.min(1, (blinkAvg - BLINK_THRESHOLD) / (1 - BLINK_THRESHOLD))),
  }

  const browUp = blendshapes
    ? ((blendshapes.browInnerUp ?? 0) +
        (blendshapes.browOuterUpLeft ?? 0) +
        (blendshapes.browOuterUpRight ?? 0)) /
      3
    : 0
  result['eyebrows-raised'] = {
    active: browUp > BROW_THRESHOLD,
    confidence: Math.max(0, Math.min(1, (browUp - BROW_THRESHOLD) / (1 - BROW_THRESHOLD))),
  }

  const yawDeg = headPose?.yawDeg ?? 0
  result['face-left'] = {
    active: yawDeg > HEAD_TURN_DEG,
    confidence: Math.max(0, Math.min(1, (yawDeg - HEAD_TURN_DEG) / (MAX_YAW_DEG - HEAD_TURN_DEG))),
  }
  result['face-right'] = {
    active: yawDeg < -HEAD_TURN_DEG,
    confidence: Math.max(0, Math.min(1, (-yawDeg - HEAD_TURN_DEG) / (MAX_YAW_DEG - HEAD_TURN_DEG))),
  }

  const pitchDeg = headPose?.pitchDeg ?? 0
  result['look-up'] = {
    active: pitchDeg > HEAD_PITCH_DEG,
    confidence: Math.max(0, Math.min(1, (pitchDeg - HEAD_PITCH_DEG) / (MAX_PITCH_DEG - HEAD_PITCH_DEG))),
  }
  result['look-down'] = {
    active: pitchDeg < -HEAD_PITCH_DEG,
    confidence: Math.max(0, Math.min(1, (-pitchDeg - HEAD_PITCH_DEG) / (MAX_PITCH_DEG - HEAD_PITCH_DEG))),
  }

  return result
}
