import type { AppStatus } from '../types'

interface StatusIndicatorProps {
  status: AppStatus
  counter: number
  earValue: number | null
}

const LABELS: Record<AppStatus, string> = {
  idle: 'Presiona "Iniciar" para comenzar',
  loading: 'Cargando modelos de detección facial...',
  ready: 'Cámara lista. Presiona "Iniciar"',
  watching: 'Observando — espera un parpadeo',
  capturing: 'Capturando fotos...',
  complete: 'Captura completada',
}

export function StatusIndicator({ status, counter, earValue }: StatusIndicatorProps) {
  return (
    <div className="status-indicator">
      <p className="status-text">{LABELS[status]}</p>
      {status === 'watching' && earValue !== null && (
        <p className="ear-text">EAR: {earValue.toFixed(3)}</p>
      )}
      {status === 'capturing' && (
        <p className="counter-text">
          {counter > 0 ? `Próxima foto en ${counter}s` : '¡Capturando!'}
        </p>
      )}
    </div>
  )
}
