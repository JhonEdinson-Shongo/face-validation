export type AppStatus = 'idle' | 'loading' | 'ready' | 'watching' | 'capturing' | 'complete'

export type AppView = 'catalog' | 'validation'

export interface Point {
  x: number
  y: number
}

export type GestureType =
  | 'eyes-closed'
  | 'eyebrows-raised'
  | 'face-right'
  | 'face-left'
  | 'look-up'
  | 'look-down'

export interface GestureResult {
  active: boolean
  confidence: number
}

export type SequenceMode = 'sequential' | 'simultaneous'

export interface Combination {
  id: string
  name: string
  description: string
  mode: SequenceMode
  steps: GestureType[]
  captureDelay: number
}

export interface GestureInfo {
  type: GestureType
  label: string
  icon: string
  description: string
}

export const GESTURES_INFO: GestureInfo[] = [
  { type: 'eyes-closed', label: 'Cerrar ojos', icon: '👁', description: 'Mantener ambos ojos cerrados' },
  { type: 'eyebrows-raised', label: 'Alzar cejas', icon: '🤨', description: 'Levantar ambas cejas' },
  { type: 'face-right', label: 'Girar rostro derecha', icon: '👉', description: 'Girar la cabeza hacia la derecha' },
  { type: 'face-left', label: 'Girar rostro izquierda', icon: '👈', description: 'Girar la cabeza hacia la izquierda' },
  { type: 'look-up', label: 'Mirar arriba', icon: '👆', description: 'Mirar hacia arriba' },
  { type: 'look-down', label: 'Mirar abajo', icon: '👇', description: 'Mirar hacia abajo' },
]

export const PRESET_COMBINATIONS: Combination[] = [
  {
    id: 'blink',
    name: 'Parpadeo simple',
    description: 'Parpadea y se tomarán 4 fotos',
    mode: 'sequential',
    steps: ['eyes-closed'],
    captureDelay: 0,
  },
  {
    id: 'eyebrows',
    name: 'Cejas arriba',
    description: 'Alza las cejas para tomar las fotos',
    mode: 'sequential',
    steps: ['eyebrows-raised'],
    captureDelay: 0,
  },
  {
    id: 'blink-eyebrows',
    name: 'Parpadeo + Cejas',
    description: 'Parpadea y luego alza las cejas en menos de 2s',
    mode: 'sequential',
    steps: ['eyes-closed', 'eyebrows-raised'],
    captureDelay: 2000,
  },
  {
    id: 'left-right',
    name: 'Giro completo',
    description: 'Gira a la izquierda y luego a la derecha',
    mode: 'sequential',
    steps: ['face-left', 'face-right'],
    captureDelay: 2000,
  },
  {
    id: 'look-all',
    name: 'Mirada completa',
    description: 'Mira arriba y luego abajo',
    mode: 'sequential',
    steps: ['look-up', 'look-down'],
    captureDelay: 2000,
  },
  {
    id: 'face-right-eyebrows',
    name: 'Giro derecha + Cejas',
    description: 'Gira a la derecha y alza las cejas simultáneamente',
    mode: 'simultaneous',
    steps: ['face-right', 'eyebrows-raised'],
    captureDelay: 0,
  },
]
