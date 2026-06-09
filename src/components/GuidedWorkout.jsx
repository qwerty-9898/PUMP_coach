import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import { GROUP_META } from '../engine/exercises.js'
import { estimateLoad } from '../engine/loads.js'
import { haptic } from '../tg.js'

const WARMUP = [
  'Лёгкое кардио 3–5 минут: быстрая ходьба, скакалка или бег на месте',
  'Суставная разминка: вращения шеи, плеч, локтей, таза, коленей, стоп',
  'Динамическая растяжка рабочих мышц (махи, выпады с поворотом)',
  '1–2 разминочных подхода первого упражнения с лёгким весом'
]

function restSeconds(rest) {
  const num = parseInt((rest || '').replace(/[^0-9].*$/, ''), 10) || 60
  return /мин/.test(rest) ? num * 60 : num
}

export default function GuidedWorkout({ session, profile, onExit, onFinish }) {
  const total = session.exercises.length
  const rest = restSeconds(session.scheme.rest)
  const [phase, setPhase] = useState('warmup')
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState(0)
  const [resting, setResting] = useState(false)
  const [left, setLeft] = useState(rest)
  const ref = useRef(null)
  const ex = session.exercises[idx]

  useEffect(() => {
    if (resting) {
      ref.current = setInterval(() => setLeft(l => {
        if (l <= 1) { clearInterval(ref.current); setResting(false); haptic('medium'); return rest }
        return l - 1
      }), 1000)
    }
    return () => clearInterval(ref.current)
  }, [resting, rest])

  function doSet() {
    haptic('light')
    const nd = done + 1; setDone(nd)
    if (nd < ex.sets) { setLeft(rest); setResting(true) }
  }
  function nextEx() {
    if (idx + 1 >= total) { onFinish && onFinish(); setPhase('done'); return }
    setIdx(idx + 1); setDone(0); setResting(false); setLeft(rest); window.scrollTo(0, 0)
  }
  function skipRest() { clearInterval(ref.current); setResting(false); setLeft(rest) }

  if (phase === 'warmup') {
    return (
      <div className="guided">
        <div className="guided-top">
          <button className="iconbtn" onClick={onExit} aria-label="Выйти"><Icon name="x" size={20} /></button>
          <span className="guided-prog"><b style={{ fontFamily: 'Oswald', fontSize: 16 }}>Разминка</b></span>
        </div>
        <div className="guided-card">
          <h2 className="display md">Сначала разомнись</h2>
          <p className="sub" style={{ marginBottom: 14 }}>5 минут разминки = меньше травм и лучше результат в подходах.</p>
          {WARMUP.map((w, i) => (
            <div className="warmrow" key={i}><span className="warmnum">{i + 1}</span><span>{w}</span></div>
          ))}
        </div>
        <button className="cta" onClick={() => setPhase('work')}><Icon name="play" size={18} /> Размялся, поехали</button>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="guided done-screen">
        <div className="done-badge"><Icon name="check" size={42} /></div>
        <h2 className="display lg">Готово!</h2>
        <p className="sub">Тренировка засчитана. {total} упражнений позади — красавчик. 💪</p>
        <button className="cta" onClick={onExit}>На главную тренировки</button>
      </div>
    )
  }

  const exDone = done >= ex.sets
  const mm = String(Math.floor(left / 60)), ss = String(left % 60).padStart(2, '0')

  return (
    <div className="guided">
      <div className="guided-top">
        <button className="iconbtn" onClick={onExit} aria-label="Выйти"><Icon name="x" size={20} /></button>
        <div className="guided-prog">
          <div className="gp-track"><div className="gp-fill" style={{ width: ((idx + (exDone ? 1 : 0)) / total) * 100 + '%' }} /></div>
          <span>{idx + 1} / {total}</span>
        </div>
      </div>

      <div className="guided-card">
        <span className="tag" style={tagStyle(ex.group)}>{GROUP_META[ex.group].label}</span>
        <h2 className="display md">{ex.name}</h2>
        <div className="guided-scheme">
          <div><span>Подходы</span><b>{ex.sets}</b></div>
          <div><span>Повторы</span><b>{ex.reps}</b></div>
          <div><span>Вес</span><b>{estimateLoad(ex, profile)}</b></div>
        </div>
        <div className="guided-tip"><Icon name="info" size={15} /> {ex.tip}</div>
      </div>

      <div className="setdots">
        {Array.from({ length: ex.sets }).map((_, i) => (
          <span key={i} className={'setdot' + (i < done ? ' on' : '')}>{i + 1}</span>
        ))}
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
        <button className="cta" onClick={doSet}><Icon name="check" size={18} /> Подход {done + 1} сделан</button>
      )}
    </div>
  )
}

function tagStyle(group) {
  const c = GROUP_META[group].color
  const n = parseInt(c.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return { color: '#fff', background: 'rgba(' + r + ',' + g + ',' + b + ',0.2)', border: '1px solid rgba(' + r + ',' + g + ',' + b + ',0.45)' }
}
