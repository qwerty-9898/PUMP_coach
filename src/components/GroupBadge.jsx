import BodyIcon from './BodyIcon.jsx'
import { GROUP_META } from '../engine/exercises.js'

export default function GroupBadge({ group, size = 40 }) {
  const m = GROUP_META[group]
  if (!m) return null
  return (
    <span className="gbadge" style={{
      width: size, height: size, color: '#c9d2df',
      background: hexA(m.color, 0.13), borderColor: hexA(m.color, 0.34)
    }}>
      <BodyIcon group={group} size={Math.round(size * 0.5)} />
    </span>
  )
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}
