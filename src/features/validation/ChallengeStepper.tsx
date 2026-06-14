import { useStore } from '../../stores/validationStore'
import { GESTURES_INFO } from '../../types'
import type { GestureType } from '../../types'

function StepNode({
  gesture,
  state,
  isLast,
}: {
  gesture: GestureType
  state: 'done' | 'current' | 'pending'
  isLast: boolean
}) {
  const info = GESTURES_INFO.find((g) => g.type === gesture)!

  return (
    <div className="step-node-wrapper">
      <div className="step-node-row">
        <div className={`step-node step-node-${state}`}>
          <span className="step-node-icon">{info.icon}</span>
          {state === 'done' && (
            <span className="step-checkmark">✓</span>
          )}
        </div>
        {!isLast && <div className="step-connector" />}
      </div>
      <span className={`step-label step-label-${state}`}>{info.label}</span>
    </div>
  )
}

export function ChallengeStepper() {
  const combination = useStore((s) => s.combination)
  const currentStep = useStore((s) => s.currentStep)
  const completedSteps = useStore((s) => s.completedSteps)

  if (!combination) return null

  return (
    <div className="challenge-stepper">
      <div className="stepper-row">
        {combination.steps.map((gesture, i) => {
          let state: 'done' | 'current' | 'pending'
          if (combination.mode === 'simultaneous') {
            state = completedSteps.includes(i) ? 'done' : 'current'
          } else {
            if (i < currentStep) state = 'done'
            else if (i === currentStep) state = 'current'
            else state = 'pending'
          }

          return (
            <StepNode
              key={i}
              gesture={gesture}
              state={state}
              isLast={i === combination.steps.length - 1}
            />
          )
        })}
      </div>
      <p className="stepper-mode-hint">
        {combination.mode === 'sequential'
          ? 'Realiza los gestos en orden'
          : 'Realiza todos los gestos simultáneamente'}
      </p>
    </div>
  )
}
