import { GROUP_META } from '../engine/exercises.js'

// Мини X-ray скелет с подсветкой зоны группы. viewBox 0 0 40 56.
// Зоны: [cx, cy, rx, ry]
const HL = {
  'плечи':   [[12, 15, 2.6, 2], [28, 15, 2.6, 2]],
  'грудь':   [[16.4, 19, 3, 2.6], [23.6, 19, 3, 2.6]],
  'спина':   [[20, 20, 5.4, 5]],
  'бицепс':  [[9.6, 21.5, 1.9, 3.2], [30.4, 21.5, 1.9, 3.2]],
  'трицепс': [[9.6, 21.5, 1.9, 3.2], [30.4, 21.5, 1.9, 3.2]],
  'пресс':   [[20, 26.5, 3.3, 4.4]],
  'ноги':    [[15.6, 40, 2.9, 7], [24.4, 40, 2.9, 7]]
}
const JOINTS = [[11, 14], [29, 14], [8, 23], [32, 23], [16, 33], [24, 33], [15, 49], [25, 49]]

export default function BodyIcon({ group, size = 40 }) {
  const color = GROUP_META[group]?.color || '#cdd5e0'
  const hl = HL[group] || []
  const uid = 'bi-' + group
  return (
    <svg width={size} height={Math.round(size * 1.4)} viewBox="0 0 40 56" fill="none" aria-hidden="true">
      <defs>
        <filter id={uid} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* скелет */}
      <g stroke="currentColor" fill="none" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.42">
        <ellipse cx="20" cy="8" rx="4" ry="4.3" />
        <path d="M17.5 11 Q20 12.8 22.5 11" />
        <line x1="20" y1="12.4" x2="20" y2="34" />
        <path d="M20 16 Q13.5 17 13 20" /><path d="M20 16 Q26.5 17 27 20" />
        <path d="M20 20 Q13 21 13.2 24" /><path d="M20 20 Q27 21 26.8 24" />
        <path d="M11 14 L8 23 L7 31" /><path d="M29 14 L32 23 L33 31" />
        <path d="M15 34 Q20 37 25 34 L24 39 Q20 41 16 39 Z" />
        <path d="M17 39 L15.6 49 L14 55.5" /><path d="M23 39 L24.4 49 L26 55.5" />
      </g>
      {/* светящиеся суставы */}
      <g fill="#ff8a3d" filter={`url(#${uid})`} opacity="0.8">
        {JOINTS.map((j, i) => <circle key={i} cx={j[0]} cy={j[1]} r="0.85" />)}
      </g>
      {/* подсветка группы */}
      <g fill={color} filter={`url(#${uid})`}>
        {hl.map((e, i) => <ellipse key={i} cx={e[0]} cy={e[1]} rx={e[2]} ry={e[3]} />)}
      </g>
    </svg>
  )
}
