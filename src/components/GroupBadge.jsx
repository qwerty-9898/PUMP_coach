import Icon from './Icon.jsx'
import { GROUP_META } from '../engine/exercises.js'

const GROUP_ICON = {
  'грудь': 'm_chest', 'спина': 'm_back', 'ноги': 'm_legs', 'плечи': 'm_shoulders',
  'бицепс': 'm_biceps', 'трицепс': 'm_triceps', 'пресс': 'm_abs'
}

export default function GroupBadge({ group, size = 38 }) {
  const m = GROUP_META[group]
  if (!m) return null
  return (
    <span className="gbadge" style={{
      width: size, height: size, color: m.color,
      background: hexA(m.color, 0.14), borderColor: hexA(m.color, 0.35)
    }}>
      <Icon name={GROUP_ICON[group]} size={Math.round(size * 0.58)} stroke={1.7} />
    </span>
  )
}

function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
}
