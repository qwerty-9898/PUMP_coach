import { GROUP_META } from '../engine/exercises.js'
import { recoveryMap } from '../engine/recovery.js'

// X-ray силуэт в стиле бренда. viewBox 0 0 48 80.
// Кости/контур — приглушённый стальной, суставы светятся оранжем,
// мышцы-зоны светятся цветом группы по нагрузке (load 0..1).

// Зоны мышц: [cx, cy, rx, ry]
const FRONT = {
  'плечи':  [[14, 17, 3, 2.5], [34, 17, 3, 2.5]],
  'грудь':  [[20, 21.5, 3.6, 3], [28, 21.5, 3.6, 3]],
  'бицепс': [[10.8, 24.5, 2.3, 3.8], [37.2, 24.5, 2.3, 3.8]],
  'пресс':  [[24, 30.5, 4, 5.2]],
  'ноги':   [[18.5, 55, 3.5, 8], [29.5, 55, 3.5, 8]]
}
const BACK = {
  'плечи':   [[14, 17, 3, 2.5], [34, 17, 3, 2.5]],
  'спина':   [[24, 22.5, 7, 6.2]],
  'трицепс': [[10.8, 24.5, 2.3, 3.8], [37.2, 24.5, 2.3, 3.8]],
  'ноги':    [[18.5, 55, 3.5, 8], [29.5, 55, 3.5, 8]]
}

const JOINTS = [[13, 16], [35, 16], [10, 27], [38, 27], [8, 37], [40, 37],
  [19, 45], [29, 45], [18, 60], [30, 60], [16.5, 74], [31.5, 74]]

function Skeleton({ back }) {
  return (
    <g stroke="currentColor" fill="none" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5">
      {/* контур тела */}
      <path d="M24 4 C20 4 18 6.5 18 9.5 C18 11.5 19 13 20.5 14
               C16 15 13.5 17 13 19 C12 22 11 26 9 32 C8 35 7.5 38 8 38.5
               M40 38.5 C40.5 38 40 35 39 32 C37 26 36 22 35 19 C34.5 17 32 15 27.5 14
               C29 13 30 11.5 30 9.5 C30 6.5 28 4 24 4 Z" opacity="0.35" />
      {/* череп */}
      <ellipse cx="24" cy="9" rx="4.6" ry="5" />
      <path d="M21 12.5 Q24 14.5 27 12.5" />
      {/* позвоночник */}
      <line x1="24" y1="14" x2="24" y2="40" />
      {back ? (
        <>
          {/* лопатки */}
          <path d="M17 17 L21 18 L19 23 Z" />
          <path d="M31 17 L27 18 L29 23 Z" />
          {/* таз сзади */}
          <path d="M18 40 Q24 43 30 40 L29 46 Q24 49 19 46 Z" />
        </>
      ) : (
        <>
          {/* ключицы */}
          <path d="M16.5 16 Q24 14 31.5 16" />
          {/* рёбра */}
          <path d="M24 18.5 Q16.5 19.5 15.5 23" /><path d="M24 18.5 Q31.5 19.5 32.5 23" />
          <path d="M24 22.5 Q15.5 23.5 15.5 27" /><path d="M24 22.5 Q32.5 23.5 32.5 27" />
          <path d="M24 26.5 Q17 27.5 17.5 30.5" /><path d="M24 26.5 Q31 27.5 30.5 30.5" />
          {/* таз спереди */}
          <path d="M18 40 Q24 44 30 40 L29 46 Q24 48 19 46 Z" />
        </>
      )}
      {/* руки */}
      <path d="M13 16 L10 27 L8 37" /><path d="M35 16 L38 27 L40 37" />
      {/* ноги */}
      <path d="M20 46 L18.5 60 L16.5 74" /><path d="M28 46 L29.5 60 L31.5 74" />
    </g>
  )
}

function Figure({ zones, loads, onPick, back }) {
  const fid = back ? 'xglow-b' : 'xglow-f'
  return (
    <svg viewBox="0 0 48 80" className="bh-svg" fill="none" aria-hidden="true">
      <defs>
        <filter id={fid} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <Skeleton back={back} />

      {/* светящиеся суставы */}
      <g fill="#ff8a3d" filter={`url(#${fid})`}>
        {JOINTS.map((j, i) => <circle key={i} cx={j[0]} cy={j[1]} r="0.9" opacity="0.85" />)}
      </g>

      {/* мышцы-зоны */}
      {Object.entries(zones).map(([g, els]) => {
        const load = loads[g] || 0
        const op = 0.12 + load * 0.66
        return (
          <g key={g} fill={GROUP_META[g].color} opacity={op} filter={`url(#${fid})`}
             onClick={onPick ? () => onPick(g) : undefined}
             style={onPick ? { cursor: 'pointer' } : undefined}>
            {els.map((e, i) => <ellipse key={i} cx={e[0]} cy={e[1]} rx={e[2]} ry={e[3]} />)}
          </g>
        )
      })}
    </svg>
  )
}

export default function BodyHeatmap({ onPick, loads }) {
  const src = loads || Object.fromEntries(recoveryMap().map(m => [m.group, m.load]))
  return (
    <div className="bh">
      <div className="bh-figs">
        <div className="bh-fig"><Figure zones={FRONT} loads={src} onPick={onPick} /><span className="bh-cap">спереди</span></div>
        <div className="bh-fig"><Figure zones={BACK} loads={src} onPick={onPick} back /><span className="bh-cap">сзади</span></div>
      </div>
    </div>
  )
}
