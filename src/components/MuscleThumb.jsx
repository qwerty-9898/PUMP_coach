import { MUSCLE_ART, MUSCLE_DOT } from './muscleArt.js'

// Маркер целевой мышцы — маленькая мигающая точка точно по центру мышцы.
export function Hl({ group }) {
  return (MUSCLE_DOT[group] || []).map((d, i) => (
    <span key={i} className="m-dot" style={{ left: d[0] + '%', top: d[1] + '%' }} />
  ))
}

// Миниатюра группы мышц с маркером.
export function MuscleThumb({ group, className = '' }) {
  return (
    <span className={'mthumb ' + className}>
      <img src={MUSCLE_ART[group]} alt="" />
      <Hl group={group} />
    </span>
  )
}
