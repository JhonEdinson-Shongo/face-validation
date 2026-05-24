import type { Point } from '../types'

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function calculateEAR(eye: Point[]): number {
  const a = dist(eye[1], eye[5])
  const b = dist(eye[2], eye[4])
  const c = dist(eye[0], eye[3])
  return (a + b) / (2 * c)
}
