import { GROUP_META } from '../engine/exercises.js'

// Подсвеченные зоны мышц на силуэте (x, y, w, h, rx) в системе 0 0 40 56
const HL = {
  'грудь':   [[14.2, 14.8, 11.6, 6, 3]],
  'спина':   [[14.2, 14.8, 11.6, 8.4, 3]],
  'пресс':   [[15.4, 21.8, 9.2, 9.4, 2.6]],
  'плечи':   [[11.6, 12.8, 6.4, 4.2, 2.1], [22, 12.8, 6.4, 4.2, 2.1]],
  'бицепс':  [[7, 14.4, 4.9, 8.2, 2.4], [28.1, 14.4, 4.9, 8.2, 2.4]],
  'трицепс': [[7, 15, 4.9, 8.2, 2.4], [28.1, 15, 4.9, 8.2, 2.4]],
  'ноги':    [[13.4, 32.5, 5.8, 11, 2.6], [21, 32.5, 5.8, 11, 2.6]]
}

export default function BodyIcon({ group, size = 40 }) {
  const color = GROUP_META[group]?.color || '#cdd5e0'
  const hl = HL[group] || []
  return (
    <svg width={size} height={Math.round(size * 1.4)} viewBox="0 0 40 56" fill="none" aria-hidden="true">
      <g fill="currentColor" opacity="0.38">
        <circle cx="20" cy="8" r="4.5" />
        <rect x="12.4" y="12.8" width="15.2" height="20.4" rx="6" />
        <rect x="7" y="13.8" width="5" height="16.4" rx="2.5" />
        <rect x="28" y="13.8" width="5" height="16.4" rx="2.5" />
        <rect x="13.3" y="31.8" width="5.9" height="20.4" rx="2.7" />
        <rect x="20.8" y="31.8" width="5.9" height="20.4" rx="2.7" />
      </g>
      <g fill={color}>
        {hl.map((r, i) => <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />)}
      </g>
    </svg>
  )
}
