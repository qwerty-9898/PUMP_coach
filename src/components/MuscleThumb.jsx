import { MUSCLE_ART } from './muscleArt.js'

// Маркеры мышц отключены по просьбе пользователя — оставлена заглушка,
// чтобы существующие импорты Hl продолжали работать без правок.
export function Hl() { return null }

// Миниатюра группы мышц (без маркера).
export function MuscleThumb({ group, className = '' }) {
  return (
    <span className={'mthumb ' + className}>
      <img src={MUSCLE_ART[group]} alt="" />
    </span>
  )
}
