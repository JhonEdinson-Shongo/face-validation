import { GESTURES_INFO, type GestureType } from '../../types'

interface Props {
  gesture: GestureType
  active: boolean
}

const ARROWS: Partial<Record<GestureType, string>> = {
  'face-left': '←',
  'face-right': '→',
  'look-up': '↑',
  'look-down': '↓',
}

const HINTS: Partial<Record<GestureType, string>> = {
  'face-left': 'Gira tu rostro hacia la IZQUIERDA (tu izquierda)',
  'face-right': 'Gira tu rostro hacia la DERECHA (tu derecha)',
  'look-up': 'Mira hacia ARRIBA',
  'look-down': 'Mira hacia ABAJO',
  'eyes-closed': 'Cierra ambos ojos',
  'eyebrows-raised': 'Levanta ambas cejas',
}

export function GestureInstruction({ gesture, active }: Props) {
  const info = GESTURES_INFO.find((g) => g.type === gesture)
  if (!info) return null

  const arrow = ARROWS[gesture] ?? ''
  const hint = HINTS[gesture] ?? info.description

  return (
    <div className={`gesture-instruction${active ? ' is-active' : ''}`}>
      <span className="gesture-instruction-arrow">{arrow}</span>
      <div className="gesture-instruction-body">
        <span className="gesture-instruction-icon">{info.icon}</span>
        <span className="gesture-instruction-label">{info.label}</span>
        <span className="gesture-instruction-hint">{hint}</span>
      </div>
    </div>
  )
}
