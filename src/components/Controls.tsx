import type { AppStatus } from '../types'

interface ControlsProps {
  status: AppStatus
  onStart: () => void
  onReset: () => void
}

export function Controls({ status, onStart, onReset }: ControlsProps) {
  return (
    <div className="controls">
      {status === 'idle' || status === 'ready' ? (
        <button className="btn btn-start" onClick={onStart} disabled={status === 'idle'}>
          Iniciar
        </button>
      ) : null}

      {status === 'complete' ? (
        <button className="btn btn-reset" onClick={onReset}>
          Reiniciar
        </button>
      ) : null}

      {(status === 'loading' || status === 'watching' || status === 'capturing') && (
        <button className="btn btn-disabled" disabled>
          {status === 'loading' ? 'Cargando...' : status === 'capturing' ? 'Capturando...' : 'Monitoreando...'}
        </button>
      )}
    </div>
  )
}
