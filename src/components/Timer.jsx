import { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

const PRESETS = [30, 60, 90, 120, 180]

export default function Timer() {
  const [total, setTotal] = useState(90)
  const [left, setLeft] = useState(90)
  const [running, setRunning] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setLeft(l => {
          if (l <= 1) { clearInterval(ref.current); setRunning(false); beep(); return 0 }
          return l - 1
        })
      }, 1000)
    }
    return () => clearInterval(ref.current)
  }, [running])

  function pick(sec) { setTotal(sec); setLeft(sec); setRunning(false) }
  function toggle() { if (left === 0) setLeft(total); setRunning(r => !r) }
  function reset() { setRunning(false); setLeft(total) }

  const pct = total ? ((total - left) / total) * 100 : 0
  const mm = String(Math.floor(left / 60)).padStart(1, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="screen">
      <div className="timercard">
        <div className="timer-ring" style={{ '--pct': pct + '%' }}>
          <div className="timer-inner">
            <span className="timer-num">{mm}:{ss}</span>
            <span className="timer-lbl">{running ? 'отдых идёт' : left === 0 ? 'готово!' : 'пауза'}</span>
          </div>
        </div>
      </div>

      <div className="timer-ctrl">
        <button className="iconbtn big" onClick={reset} aria-label="Сброс"><Icon name="refresh" size={22} /></button>
        <button className="cta play" onClick={toggle}>
          {running ? <><Icon name="pause" size={20} /> Пауза</> : <><Icon name="play" size={20} /> Старт</>}
        </button>
      </div>

      <div className="block-head" style={{ marginTop: 8 }}><span className="flabel">Быстрый выбор</span></div>
      <div className="seg days">
        {PRESETS.map(s => (
          <button key={s} className={'seg-btn' + (total === s ? ' on' : '')} onClick={() => pick(s)}>
            {s < 60 ? s + 'с' : (s / 60) + 'м'}
          </button>
        ))}
      </div>
    </div>
  )
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = 880; o.start()
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    o.stop(ctx.currentTime + 0.6)
  } catch (e) {}
}
