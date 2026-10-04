import { useStore, TOTAL_PHOTOS } from '../../stores/validationStore'

export function PhotoGrid() {
  const photos = useStore((s) => s.photos)

  if (photos.length === 0) return null

  return (
    <div className="photo-grid-section">
      <h3 className="section-heading">Fotos capturadas</h3>
      <div className="photo-grid">
        {Array.from({ length: TOTAL_PHOTOS }).map((_, i) => (
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
