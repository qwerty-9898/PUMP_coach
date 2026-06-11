import { useState } from 'react'
import frontImg from '../assets/skeleton/muscle_front.png'
import backImg from '../assets/skeleton/muscle_back.png'
import { GROUP_META } from '../engine/exercises.js'
import { recoveryMap } from '../engine/recovery.js'
import { FRONT_ZONES, BACK_ZONES } from './bodyZones.js'

export default function BodyHeatmap({ onPick, loads }) {
  const src = loads || Object.fromEntries(recoveryMap().map(m => [m.group, m.load]))
  const [view, setView] = useState('front')
  const img = view === 'front' ? frontImg : backImg
  const zones = view === 'front' ? FRONT_ZONES : BACK_ZONES

  return (
    <div className="bh2">
      <div className="bh2-toggle">
        <button className={'bh2-tab' + (view === 'front' ? ' on' : '')} onClick={() => setView('front')}>Спереди</button>
        <button className={'bh2-tab' + (view === 'back' ? ' on' : '')} onClick={() => setView('back')}>Сзади</button>
      </div>
      <div className="bh2-stage">
        <div className="bh2-frame">
          <img className="bh2-img" src={img} alt="" />
          {Object.entries(zones).map(([g, els]) =>
            els.map((e, i) => {
              const load = src[g] || 0
              return (
                <span key={g + i} className="bh2-zone"
                  onClick={onPick ? () => onPick(g) : undefined}
                  style={{
                    left: e[0] + '%', top: e[1] + '%', width: e[2] + '%', height: e[3] + '%',
                    background: `radial-gradient(closest-side, ${GROUP_META[g].color}, transparent 72%)`,
                    opacity: 0.3 + load * 0.7,
                    cursor: onPick ? 'pointer' : 'default'
                  }} />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
