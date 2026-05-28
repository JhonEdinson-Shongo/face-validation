import { useState } from 'react'
import { useStore } from '../../stores/validationStore'
import { GESTURES_INFO } from '../../types'
import type { GestureType, SequenceMode } from '../../types'

export function ComboBuilder() {
  const startValidation = useStore((s) => s.startValidation)
  const [name, setName] = useState('')
  const [mode, setMode] = useState<SequenceMode>('sequential')
  const [selected, setSelected] = useState<GestureType[]>([])

  const canStart = selected.length > 0

  function toggleGesture(type: GestureType) {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((g) => g !== type) : [...prev, type],
    )
  }

  function handleStart() {
    if (!canStart) return
    startValidation({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: `${mode === 'sequential' ? 'Secuencial' : 'Simultáneo'} — ${selected.length} gesto${selected.length > 1 ? 's' : ''}`,
      mode,
      steps: selected,
      captureDelay: mode === 'sequential' ? 2000 : 0,
    })
  }

  return (
    <section className="combo-builder-section">
      <h2 className="section-heading">Combinación personalizada</h2>
      <div className="builder">
        <input
          className="builder-input"
          placeholder="Nombre de la combinación"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="builder-mode">
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'sequential'}
              onChange={() => setMode('sequential')}
            />
            Secuencial
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              checked={mode === 'simultaneous'}
              onChange={() => setMode('simultaneous')}
            />
            Simultáneo
          </label>
        </div>

        <p className="builder-hint">Selecciona los gestos:</p>
        <div className="builder-gestures">
          {GESTURES_INFO.map((g) => (
            <label
              key={g.type}
              className={`builder-chip ${selected.includes(g.type) ? 'chip-active' : ''}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(g.type)}
                onChange={() => toggleGesture(g.type)}
              />
              {g.icon} {g.label}
            </label>
          ))}
        </div>

        <button className="btn btn-start" disabled={!canStart} onClick={handleStart}>
          Iniciar validación
        </button>
      </div>
    </section>
  )
}
