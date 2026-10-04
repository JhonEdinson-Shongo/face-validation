import { useStore, FINAL_BURST_PHOTOS } from '../../stores/validationStore'

export function PhotoGrid() {
  const photos = useStore((s) => s.photos)
  const combination = useStore((s) => s.combination)

  if (photos.length === 0) return null

  const total = (combination?.steps.length ?? 0) + FINAL_BURST_PHOTOS

  return (
    <div className="photo-grid-section">
      <h3 className="section-heading">Fotos capturadas</h3>
      <div className="photo-grid">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="photo-cell">
            {photos[i] ? (
              <img
                src={photos[i]}
                alt={`Foto ${i + 1}`}
                className="photo-image"
              />
            ) : (
              <div className="photo-placeholder">
                <span>{i + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
