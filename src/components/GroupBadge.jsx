import { MUSCLE_ART } from './muscleArt.js'
import { GROUP_META } from '../engine/exercises.js'

export default function GroupBadge({ group, size = 40 }) {
  const m = GROUP_META[group]
  if (!m) return null
  return (
    <span className="gbadge" style={{ width: size, height: size, borderColor: hexA(m.color, 0.5) }}>
      <img className="gbadge-img" src={MUSCLE_ART[group]} alt="" />
    </span>
  )
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'
}
