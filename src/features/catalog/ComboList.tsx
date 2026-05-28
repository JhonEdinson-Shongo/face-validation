import { useStore } from '../../stores/validationStore'
import { PRESET_COMBINATIONS, GESTURES_INFO } from '../../types'
import type { Combination } from '../../types'

function comboLabel(combo: Combination) {
  return combo.steps
    .map((s) => GESTURES_INFO.find((g) => g.type === s)?.label ?? s)
    .join(combo.mode === 'simultaneous' ? ' + ' : ' → ')
}

export function ComboList() {
  const startValidation = useStore((s) => s.startValidation)

  return (
    <section className="combo-list-section">
      <h2 className="section-heading">Combinaciones predefinidas</h2>
      <div className="combo-list">
        {PRESET_COMBINATIONS.map((combo) => (
          <button
            key={combo.id}
            className="combo-card"
            onClick={() => startValidation(combo)}
          >
            <div className="combo-card-top">
              <span className="combo-name">{combo.name}</span>
              <span className={`combo-mode mode-${combo.mode}`}>
                {combo.mode === 'sequential' ? 'Secuencial' : 'Simultáneo'}
              </span>
            </div>
            <span className="combo-path">{comboLabel(combo)}</span>
            <span className="combo-desc">{combo.description}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
