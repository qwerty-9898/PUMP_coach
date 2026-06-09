import { useState } from 'react'
import Icon from './Icon.jsx'
import GroupBadge from './GroupBadge.jsx'
import { GROUPS, GROUP_META } from '../engine/exercises.js'
import { generateSession } from '../engine/sessionGenerator.js'
import { estimateLoad } from '../engine/loads.js'
import { store, todayKey } from '../storage.js'

export default function WorkoutBuilder({ program, profile }) {
  const [picked, setPicked] = useState([])
  const [session, setSession] = useState(null)
  const [saved, setSaved] = useState(false)

  const toggle = (g) => setPicked(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])

  function build(groups) {
    if (!groups.length) return
    setSession(generateSession({ groups, goal: profile.goal, level: profile.level, equip: profile.equip }))
    setSaved(false)
    setTimeout(() => document.getElementById('session')?.scrollIntoView({ behavior: 'smooth' }), 60)
  }
  function autoPick() {
    const preset = program.presets[Math.floor(Math.random() * program.presets.length)]
    setPicked(preset.groups); build(preset.groups)
  }
  function finish() {
    const pr = store.getProgress()
    pr.workouts.push({ date: todayKey(), groups: session.groups, count: session.exercises.length })
    store.setProgress(pr); setSaved(true)
  }

  return (
    <section className="block">
      <div className="block-head">
        <h2 className="display sm">Тренировка на сегодня</h2>
        <p className="sub">Программа: <b className="accent">{program.name}</b>. Выбери день или доверь мне.</p>
      </div>

      <div className="presets">
        {program.presets.map((p, i) => (
          <button key={i} className="preset" onClick={() => { setPicked(p.groups); build(p.groups) }}>{p.name}</button>
        ))}
      </div>

      <button className="cta auto-btn" onClick={autoPick}><Icon name="bolt" size={18} /> Собери тренировку за меня</button>

      <div className="divider"><span>или вручную по группам</span></div>

      <div className="muscles">
        {GROUPS.map(g => (
          <button key={g} className={'muscle' + (picked.includes(g) ? ' on' : '')} onClick={() => toggle(g)}>
            <GroupBadge group={g} size={36} />
            <span className="m-name">{GROUP_META[g].label}</span>
          </button>
        ))}
      </div>

      <button className={'cta' + (picked.length ? '' : ' disabled')} disabled={!picked.length} onClick={() => build(picked)}>
        {picked.length ? 'Собрать тренировку (' + picked.length + ')' : 'Выбери хотя бы одну группу'}
      </button>

      {session && <Session session={session} profile={profile} saved={saved} onFinish={finish} />}
    </section>
  )
}

function Session({ session, profile, saved, onFinish }) {
  return (
    <div id="session" className="session">
      <div className="session-head">
        <h3 className="display sm">Твоя тренировка</h3>
        <div className="chips">
          {session.groups.map(g => <span key={g} className="chip">{GROUP_META[g].label}</span>)}
        </div>
        <div className="scheme">
          <div><span>Подходы</span><b>{session.scheme.sets}</b></div>
          <div><span>Повторы</span><b>{session.scheme.reps}</b></div>
          <div><span>Отдых</span><b>{session.scheme.rest}</b></div>
        </div>
      </div>

      {session.exercises.map((ex, i) => (
        <div className="ex" key={ex.id}>
          <div className="ex-top">
            <span className="ex-idx">{i + 1}</span>
            <div className="ex-main">
              <div className="ex-row">
                <span className="ex-name">{ex.name}</span>
                <span className="ex-sets">{ex.sets}×{ex.reps}</span>
              </div>
              <div className="ex-meta">
                <span className="tag" style={tagStyle(ex.group)}>{GROUP_META[ex.group].label}</span>
                {ex.compound && <span className="tag base">база</span>}
                <span className="tag load">{estimateLoad(ex, profile)}</span>
              </div>
              <div className="ex-musc">{ex.muscles} · отдых {ex.rest}</div>
            </div>
          </div>
          <div className="ex-tip"><Icon name="info" size={14} /> {ex.tip}</div>
        </div>
      ))}

      {session.cardio && (
        <div className="ex">
          <div className="ex-top">
            <span className="ex-idx"><Icon name="activity" size={16} /></span>
            <div className="ex-main">
              <div className="ex-row"><span className="ex-name">Кардио в конце</span><span className="ex-sets">15–20 мин</span></div>
              <div className="ex-tip"><Icon name="info" size={14} /> Лёгкий темп: ходьба, дорожка или велотренажёр.</div>
            </div>
          </div>
        </div>
      )}

      <p className="load-note">Веса — ориентир под твои параметры. Слушай тело: подбирай так, чтобы последние повторы давались тяжело, но с чистой техникой.</p>

      <button className={'cta' + (saved ? ' done' : '')} onClick={onFinish} disabled={saved}>
        {saved ? <><Icon name="check" size={18} /> Тренировка засчитана</> : <><Icon name="check" size={18} /> Отметить выполненной</>}
      </button>
    </div>
  )
}

function tagStyle(group) {
  const c = GROUP_META[group].color
  const n = parseInt(c.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return { color: c, background: 'rgba(' + r + ',' + g + ',' + b + ',0.14)' }
}
