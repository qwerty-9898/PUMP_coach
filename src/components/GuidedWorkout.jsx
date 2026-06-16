import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import { GROUP_META } from '../engine/exercises.js'
import { MUSCLE_ART } from './muscleArt.js'
import { estimateLoad } from '../engine/loads.js'
import { suggestNext, lastSummary, isPR } from '../engine/progress.js'
import { store, todayKey, calcStreak } from '../storage.js'
import { haptic, shareText } from '../tg.js'

const WARMUP = [
  'Лёгкое кардио 3–5 минут: ходьба, скакалка или бег на месте',
  'Суставная разминка: шея, плечи, локти, таз, колени, стопы',
  'Динамическая растяжка рабочих мышц',
  '1–2 разминочных подхода первого упражнения с лёгким весом'
]
function restSeconds(rest) {
  const num = parseInt((rest || '').replace(/[^0-9].*$/, ''), 10) || 60
  return /мин/.test(rest) ? num * 60 : num
}
function parseLoad(str) { const m = (str || '').match(/(\d+(\.\d+)?)/); return m ? Number(m[1]) : '' }

export default function GuidedWorkout({ session, profile, onExit, onFinish }) {
  const total = session.exercises.length
  const rest = restSeconds(session.scheme.rest)
  const [phase, setPhase] = useState('warmup')
  const [idx, setIdx] = useState(0)
  const [logs, setLogs] = useState({})
  const [resting, setResting] = useState(false)
  const [left, setLeft] = useState(rest)
  const [curW, setCurW] = useState('')
  const [curR, setCurR] = useState('')
  const [prFlash, setPrFlash] = useState(false)
  const [milestones, setMilestones] = useState([])
  const ref = useRef(null)
  const ex = session.exercises[idx]
  const working = (logs[idx] || []).filter(s => !s.warm)
  const doneSets = working.length
  const warmSets = (logs[idx] || []).filter(s => s.warm).length

  // подстановка веса/повторов при входе в упражнение
  useEffect(() => {
    if (phase !== 'work') return
    const sug = suggestNext(ex.id, ex.reps)
    if (sug) { setCurW(String(sug.weight)); setCurR(String(sug.reps)) }
    else {
      const w = parseLoad(estimateLoad(ex, profile))
      setCurW(w === '' ? '' : String(w))
      setCurR(String((ex.reps || '').split(/[–-]/)[0] || 10))
    }
  }, [idx, phase])

  useEffect(() => {
    if (resting) {
      ref.current = setInterval(() => setLeft(l => {
        if (l <= 1) { clearInterval(ref.current); setResting(false); haptic('medium'); return rest }
        return l - 1
      }), 1000)
    }
    return () => clearInterval(ref.current)
  }, [resting, rest])

  function recordSet(warm) {
    const w = Number(curW) || 0, r = Number(curR) || 0
    if (r <= 0) return
    haptic('light')
    if (!warm && w > 0 && isPR(ex.id, w, r) && doneSets === 0) { setPrFlash(true); setTimeout(() => setPrFlash(false), 2000) }
    const next = { ...logs, [idx]: [...(logs[idx] || []), { w, r, warm: !!warm }] }
    setLogs(next)
    const workCount = next[idx].filter(s => !s.warm).length
    if (!warm && workCount < ex.sets) { setLeft(rest); setResting(true) }
  }
  function nextEx() {
    if (idx + 1 >= total) { finishAll(); return }
    setIdx(idx + 1); setResting(false); setLeft(rest); window.scrollTo(0, 0)
  }
  function finishAll() {
    const date = todayKey()
    const miles = []
    const TH = [20, 30, 40, 50, 60, 80, 100, 120, 140, 160, 180, 200]
    session.exercises.forEach((e, i) => {
      const sets = (logs[i] || []).filter(s => s.r > 0 && !s.warm)
      if (!sets.length) return
      const prev = store.getExLogs(e.id).reduce((m, l) => Math.max(m, l.sets.reduce((mm, s) => Math.max(mm, s.w || 0), 0)), 0)
      const newMax = sets.reduce((m, s) => Math.max(m, s.w || 0), 0)
      for (const t of TH) { if (newMax >= t && prev < t) miles.push(e.name + ' — взял ' + t + ' кг!') }
      store.addLog({ date, exId: e.id, name: e.name, group: e.group, sets })
    })
    setMilestones(miles)
    onFinish && onFinish()
    setPhase('done')
  }
  function skipRest() { clearInterval(ref.current); setResting(false); setLeft(rest) }

  if (phase === 'warmup') {
    return (
      <div className="guided">
        <div className="guided-top">
          <button className="iconbtn" onClick={onExit}><Icon name="x" size={20} /></button>
          <span className="guided-prog"><b style={{ fontFamily: 'Unbounded', fontSize: 15 }}>Разминка</b></span>
        </div>
        <div className="guided-card">
          <h2 className="display md">Сначала разомнись</h2>
          <p className="sub" style={{ marginBottom: 12 }}>5 минут разминки = меньше травм и лучше результат.</p>
          {WARMUP.map((w, i) => <div className="warmrow" key={i}><span className="warmnum">{i + 1}</span><span>{w}</span></div>)}
        </div>
        <button className="cta" onClick={() => setPhase('work')}><Icon name="play" size={18} /> Размялся, поехали</button>
      </div>
    )
  }
  if (phase === 'done') {
    const names = session.groups.map(g => GROUP_META[g].label).join(' + ')
    const streak = calcStreak(store.getProgress().workouts.map(w => w.date))
    const shareMsg = '🔥 Затренил в PUMP: ' + names + ' — ' + session.exercises.length + ' упр.' + (streak > 1 ? ' Серия ' + streak + ' дней!' : '') + '\nГо тренироваться со мной 💪'
    return (
      <div className="guided done-screen">
        <div className="done-badge"><Icon name="check" size={42} /></div>
        <h2 className="display lg">Готово!</h2>
        <p className="sub">Тренировка засчитана, подходы записаны. Прогресс смотри во вкладке «Прогресс».</p>
        {milestones.length > 0 && (
          <div className="done-miles">
            {milestones.map((m, i) => <div key={i}><Icon name="trophy" size={15} /> {m}</div>)}
          </div>
        )}
        <div className="done-actions">
          <button className="cta" onClick={onExit}>К тренировкам</button>
          <button className="cta ghost-cta" onClick={() => shareText(shareMsg)}><Icon name="share" size={18} /> Поделиться</button>
        </div>
      </div>
    )
  }

  const exDone = doneSets >= ex.sets
  const last = lastSummary(ex.id)
  const sug = suggestNext(ex.id, ex.reps)
  const mm = String(Math.floor(left / 60)), ss = String(left % 60).padStart(2, '0')

  return (
    <div className="guided">
      <div className="guided-top">
        <button className="iconbtn" onClick={onExit}><Icon name="x" size={20} /></button>
        <div className="guided-prog">
          <div className="gp-track"><div className="gp-fill" style={{ width: ((idx + (exDone ? 1 : 0)) / total) * 100 + '%' }} /></div>
          <span>{idx + 1} / {total}</span>
        </div>
      </div>

      <div className={'guided-card' + (prFlash ? ' pr' : '')}>
        <img className="guided-art" src={MUSCLE_ART[ex.group]} alt="" />
        <span className="tag" style={tagStyle(ex.group)}>{GROUP_META[ex.group].label}</span>
        <h2 className="display md">{ex.name}</h2>
        <div className="guided-meta">
          <span>Цель: <b>{ex.sets}×{ex.reps}</b></span>
          {last && <span className="last-line">Прошлый раз: {last}</span>}
          {sug && <span className="sug-line"><Icon name="bolt" size={13} /> Сегодня: {sug.weight} кг × {sug.reps} — {sug.note}</span>}
        </div>
        {prFlash && <div className="pr-flash"><Icon name="trophy" size={16} /> Новый личный рекорд!</div>}
      </div>

      {warmSets > 0 && <div className="warm-line"><Icon name="flame" size={13} /> Разминка: {warmSets} подх.</div>}
      <div className="setdots">
        {Array.from({ length: ex.sets }).map((_, i) => {
          const s = working[i]
          return <span key={i} className={'setdot' + (i < doneSets ? ' on' : '')}>{s ? (s.w ? s.w + '×' + s.r : s.r) : i + 1}</span>
        })}
      </div>

      {resting ? (
        <div className="restbox">
          <span className="rest-lbl">Отдых</span>
          <span className="rest-time">{mm}:{ss}</span>
          <button className="cta sm ghost-cta" onClick={skipRest}>Пропустить отдых</button>
        </div>
      ) : exDone ? (
        <button className="cta" onClick={nextEx}>
          {idx + 1 >= total ? <><Icon name="flag" size={18} /> Завершить тренировку</> : <><Icon name="arrow" size={18} /> Следующее упражнение</>}
        </button>
      ) : (
        <div className="setlogger">
          <div className="setlog-inputs">
            <label><span>Вес, кг</span>
              <input type="number" inputMode="decimal" value={curW} placeholder="0" onChange={e => setCurW(e.target.value)} />
            </label>
            <span className="setlog-x">×</span>
            <label><span>Повторы</span>
              <input type="number" inputMode="numeric" value={curR} onChange={e => setCurR(e.target.value)} />
            </label>
          </div>
          <div className="setlog-actions">
            <button className="cta sm ghost-cta" onClick={() => recordSet(true)}><Icon name="flame" size={16} /> Разминка</button>
            <button className="cta" onClick={() => recordSet(false)}><Icon name="check" size={18} /> Подход {doneSets + 1}</button>
          </div>
        </div>
      )}

      <div className="guided-tip"><Icon name="info" size={15} /> {ex.tip}</div>
    </div>
  )
}

function tagStyle(group) {
  const c = GROUP_META[group].color
  const n = parseInt(c.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return { color: '#fff', background: 'rgba(' + r + ',' + g + ',' + b + ',0.2)', border: '1px solid rgba(' + r + ',' + g + ',' + b + ',0.45)' }
}
