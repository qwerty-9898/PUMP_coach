import { GROUP_META } from '../engine/exercises.js'
import { recoveryMap } from '../engine/recovery.js'

// Зоны мышц на силуэте (x, y, w, h, rx) в системе 0 0 40 60
const FRONT = {
  'плечи':  [[11.4, 12.6, 6.6, 4.4, 2.2], [22, 12.6, 6.6, 4.4, 2.2]],
  'грудь':  [[14.0, 14.8, 12.0, 6.2, 3]],
  'бицепс': [[6.8, 15.2, 5.0, 7.6, 2.4], [28.2, 15.2, 5.0, 7.6, 2.4]],
  'пресс':  [[15.2, 21.8, 9.6, 9.6, 2.6]],
  'ноги':   [[13.2, 32.6, 6.0, 11.4, 2.7], [20.8, 32.6, 6.0, 11.4, 2.7]]
}
const BACK = {
  'плечи':   [[11.4, 12.6, 6.6, 4.4, 2.2], [22, 12.6, 6.6, 4.4, 2.2]],
  'спина':   [[14.0, 14.6, 12.0, 9.4, 3]],
  'трицепс': [[6.8, 15.2, 5.0, 7.6, 2.4], [28.2, 15.2, 5.0, 7.6, 2.4]],
  'ноги':    [[13.2, 32.6, 6.0, 11.4, 2.7], [20.8, 32.6, 6.0, 11.4, 2.7]]
}

function Figure({ zones, loads, onPick }) {
  return (
    <svg viewBox="0 0 40 60" className="bh-svg" fill="none" aria-hidden="true">
      <g fill="currentColor" opacity="0.30">
        <circle cx="20" cy="7.4" r="4.6" />
        <rect x="12.2" y="12.4" width="15.6" height="20.8" rx="6" />
        <rect x="6.6" y="13.6" width="5.2" height="16.8" rx="2.6" />
        <rect x="28.2" y="13.6" width="5.2" height="16.8" rx="2.6" />
        <rect x="13.1" y="31.6" width="6.1" height="21" rx="2.8" />
        <rect x="20.8" y="31.6" width="6.1" height="21" rx="2.8" />
      </g>
      {Object.entries(zones).map(([g, rects]) => {
        const load = loads[g] || 0
        const op = 0.14 + load * 0.72
        return (
          <g key={g} fill={GROUP_META[g].color} opacity={op}
             onClick={onPick ? () => onPick(g) : undefined}
             style={onPick ? { cursor: 'pointer' } : undefined}>
            {rects.map((r, i) => <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />)}
          </g>
        )
      })}
    </svg>
  )
}

export default function BodyHeatmap({ onPick }) {
  const map = recoveryMap()
  const loads = Object.fromEntries(map.map(m => [m.group, m.load]))
  return (
    <div className="bh">
      <div className="bh-figs">
        <div className="bh-fig"><Figure zones={FRONT} loads={loads} onPick={onPick} /><span className="bh-cap">спереди</span></div>
        <div className="bh-fig"><Figure zones={BACK} loads={loads} onPick={onPick} /><span className="bh-cap">сзади</span></div>
      </div>
    </div>
  )
}
