import frontImg from '../assets/skeleton/front.png'
import backImg from '../assets/skeleton/back.png'
import { GROUP_META } from '../engine/exercises.js'
import { recoveryMap } from '../engine/recovery.js'
import { FRONT_ZONES, BACK_ZONES } from './bodyZones.js'

function Figure({ img, zones, loads, onPick, cap }) {
  return (
    <div className="bh-fig">
      <div className="bh-frame">
        <img className="bh-img" src={img} alt="" />
        {Object.entries(zones).map(([g, els]) =>
          els.map((e, i) => {
            const load = loads[g] || 0
            return (
              <span key={g + i} className="bh-zone"
                onClick={onPick ? () => onPick(g) : undefined}
                style={{
                  left: e[0] + '%', top: e[1] + '%', width: e[2] + '%', height: e[3] + '%',
                  background: `radial-gradient(closest-side, ${GROUP_META[g].color}, transparent 72%)`,
                  opacity: 0.12 + load * 0.72,
                  cursor: onPick ? 'pointer' : 'default'
                }} />
            )
          })
        )}
      </div>
      <span className="bh-cap">{cap}</span>
    </div>
  )
}

export default function BodyHeatmap({ onPick, loads }) {
  const src = loads || Object.fromEntries(recoveryMap().map(m => [m.group, m.load]))
  return (
    <div className="bh">
      <div className="bh-figs">
        <Figure img={frontImg} zones={FRONT_ZONES} loads={src} onPick={onPick} cap="спереди" />
        <Figure img={backImg} zones={BACK_ZONES} loads={src} onPick={onPick} cap="сзади" />
      </div>
    </div>
  )
}
