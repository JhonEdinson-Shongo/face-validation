import { useStore, CAPTURE_COUNTDOWN_SECONDS, FINAL_BURST_PHOTOS } from '../../stores/validationStore'

export function CaptureStatus() {
  const capturing = useStore((s) => s.capturing)
  const countdown = useStore((s) => s.countdown)
  const photos = useStore((s) => s.photos)
  const combination = useStore((s) => s.combination)

  if (countdown !== null) {
    // El número grande ya se muestra dentro del óvalo (SteadyFaceMask):
    // aquí solo la barra de progreso para no duplicar.
    return (
      <div className="capture-status capture-status-countdown">
        <div className="capture-countdown-bar">
          <div
            className="capture-countdown-fill"
            style={{ width: `${((countdown - 1) / (CAPTURE_COUNTDOWN_SECONDS - 1)) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  if (!capturing) return null

  const total = (combination?.steps.length ?? 0) + FINAL_BURST_PHOTOS
  const done = Math.min(photos.length, total)

  return (
    <div className="capture-status">
      <div className="capture-progress">
        <div
          className="capture-bar"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      <p className="capture-text">
        Capturando... {done}/{total}
      </p>
    </div>
  )
}
