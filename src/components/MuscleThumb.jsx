import { MUSCLE_ART, MUSCLE_HL } from './muscleArt.js'

// Маркер целевой мышцы (кольцо-прицел). Координаты в % из MUSCLE_HL.
export function Hl({ group }) {
  return (MUSCLE_HL[group] || []).map((h, i) => (
    <span key={i} className="m-hl" style={{ left: h[0] + '%', top: h[1] + '%', width: h[2] + '%', height: h[3] + '%' }} />
  ))
}

// Маленькая миниатюра группы мышц с маркером — для строк и карточек.
export function MuscleThumb({ group, className = '' }) {
  return (
    <span className={'mthumb ' + className}>
      <img src={MUSCLE_ART[group]} alt="" />
      <Hl group={group} />
    </span>
  )
}
