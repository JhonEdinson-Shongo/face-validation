import { useStore, CAPTURE_COUNTDOWN_SECONDS } from '../../stores/validationStore'

export function CaptureStatus() {
  const capturing = useStore((s) => s.capturing)
  const countdown = useStore((s) => s.countdown)
  const photos = useStore((s) => s.photos)

  if (countdown !== null) {
    return (
      <div className="capture-status capture-status-countdown">
        {countdown > 0 && (
          <>
            <div className="capture-countdown-number">{countdown}</div>
            <div className="capture-countdown-bar">
              <div
                className="capture-countdown-fill"
                style={{ width: `${(countdown / CAPTURE_COUNTDOWN_SECONDS) * 100}%` }}
              />
            </div>
          </>
        )}
        <p className="capture-text">
          {countdown === -1 ? 'Preparando...' : 'Preparando captura...'}
        </p>
      </div>
    )
  }

  if (!capturing) return null

  return (
    <div className="capture-status">
      <div className="capture-progress">
        <div
          className="capture-bar"
          style={{ width: `${(photos.length / 3) * 100}%` }}
        />
      </div>
      <p className="capture-text">
        Capturando... {photos.length + 1}/3
      </p>
    </div>
  )
}
