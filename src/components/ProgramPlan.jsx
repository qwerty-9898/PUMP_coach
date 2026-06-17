import { useState } from 'react'
import Icon from './Icon.jsx'
import { GROUP_META } from '../engine/exercises.js'
import { buildMesocycle } from '../engine/programPlan.js'

function chipStyle(group) {
  const c = GROUP_META[group].color
  const n = parseInt(c.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return { background: 'rgba(' + r + ',' + g + ',' + b + ',0.18)', color: '#fff', border: '1px solid rgba(' + r + ',' + g + ',' + b + ',0.4)' }
}

export default function ProgramPlan({ profile, programId, onStartDay, onClose }) {
  const meso = buildMesocycle(profile, programId)
  const [wi, setWi] = useState(0)
  const w = meso.weeks[wi]

  return (
    <div className="screen">
      <button className="backrow" onClick={onClose}><Icon name="back" size={18} /> К тренировке</button>
      <div className="block-head">
        <h2 className="display sm">План на 4 недели</h2>
        <p className="sub"><b className="accent">{meso.program.name}</b> · цель {meso.goal} · {meso.daysPerWeek} дн/нед</p>
      </div>

      <div className="wk-tabs">
        {meso.weeks.map((x, i) => (
          <button key={i} className={'wk-tab' + (wi === i ? ' on' : '')} onClick={() => setWi(i)}>
            <span className="wk-n">Нед {x.n}</span>
            <span className="wk-t">{x.tag}</span>
          </button>
        ))}
      </div>

      <div className={'wk-note' + (w.deload ? ' deload' : '')}>
        <div className="wk-note-head">
          <span className="wk-note-title">{w.title}</span>
          <span className="wk-note-scheme">{w.scheme}</span>
        </div>
        <p>{w.note}</p>
      </div>

      <span className="more-lbl" style={{ margin: '6px 2px 8px', display: 'block' }}>Дни недели</span>
      <div className="plan-days">
        {meso.week.map((d, i) => d.rest ? (
          <div className="plan-day rest" key={i}><span className="pd-day">{d.day}</span><span className="pd-rest">Отдых</span></div>
        ) : (
          <div className="plan-day" key={i}>
            <span className="pd-day">{d.day}</span>
            <div className="pd-main">
              <span className="pd-label">{d.label}</span>
              <div className="pd-chips">{d.groups.map(g => <span key={g} className="pd-chip" style={chipStyle(g)}>{GROUP_META[g].label}</span>)}</div>
            </div>
            <button className="pd-start" onClick={() => onStartDay(d.groups)} aria-label="Начать"><Icon name="play" size={15} /></button>
          </div>
        ))}
      </div>

      <p className="load-note">Прошёл 4 недели — начни цикл заново, взяв за базу чуть большие веса, чем на 1-й неделе. Так прогресс не останавливается.</p>
    </div>
  )
}
