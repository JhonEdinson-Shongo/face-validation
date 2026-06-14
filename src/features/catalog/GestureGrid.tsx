import { GESTURES_INFO } from '../../types'

export function GestureGrid() {
  return (
    <section className="gesture-grid-section">
      <h2 className="section-heading">Gestos disponibles</h2>
      <div className="gesture-grid">
        {GESTURES_INFO.map((g) => (
          <div key={g.type} className="gesture-card">
            <span className="gesture-icon">{g.icon}</span>
            <span className="gesture-label">{g.label}</span>
            <span className="gesture-desc">{g.description}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
