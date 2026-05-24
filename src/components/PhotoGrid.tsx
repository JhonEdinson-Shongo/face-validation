interface PhotoGridProps {
  photos: string[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <div className="photo-grid">
      {Array.from({ length: 4 }).map((_, i) => (
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
  )
}
