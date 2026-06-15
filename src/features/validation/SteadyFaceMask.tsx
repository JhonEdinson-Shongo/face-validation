type OvalCategory = 'good' | 'partial' | 'outside'

interface Props {
  phase: 'gestures' | 'countdown' | 'capturing'
  countdownValue: number
  photoIndex: number
  totalPhotos: number
  ovalCategory: OvalCategory
}

const OVAL_LABELS: Record<OvalCategory, { msg: string; cn: string }> = {
  good: { msg: '', cn: 'steady-oval-good' },
  partial: { msg: 'Acércate más al centro', cn: 'steady-oval-partial' },
  outside: { msg: 'Debes estar dentro del óvalo', cn: 'steady-oval-outside' },
}

export function SteadyFaceMask({ phase, countdownValue, photoIndex, totalPhotos, ovalCategory }: Props) {
  const ovalLabel = OVAL_LABELS[ovalCategory]

  return (
    <div className="steady-overlay">
      <div className="steady-vignette" />

      <div className="steady-center">
        <div className={`steady-oval ${ovalLabel.cn}`}>
          {phase === 'countdown' && (
            <span className="steady-number">{countdownValue > 0 ? countdownValue : ''}</span>
          )}
          {phase === 'capturing' && (
            <span className="steady-number">
              {photoIndex + 1}
              <span className="steady-total">/{totalPhotos}</span>
            </span>
          )}
        </div>
      </div>

      <div className="steady-footer">
        {phase === 'gestures' && ovalCategory !== 'good' && (
          <p className="steady-title">{ovalLabel.msg}</p>
        )}
        {phase === 'countdown' && (
          <>
            <p className="steady-title">Mantén tu rostro quieto</p>
            <p className="steady-sub">Prepárate para las fotos</p>
          </>
        )}
        {phase === 'capturing' && (
          <>
            <p className="steady-title">Mantén tu rostro quieto</p>
            <p className="steady-sub">Permanece dentro del marco mientras se toman las fotos</p>
          </>
        )}
      </div>
    </div>
  )
}
