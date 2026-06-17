import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { MUSCLE_ART } from './muscleArt.js'
import { Hl } from './MuscleThumb.jsx'
import GuidedWorkout from './GuidedWorkout.jsx'
import { GROUPS, GROUP_META } from '../engine/exercises.js'
import { generateSession, pickAlternative, shapeExercise, sessionStats } from '../engine/sessionGenerator.js'
import { presetFreshness } from '../engine/recovery.js'
import { estimateLoad } from '../engine/loads.js'
import { store, todayKey } from '../storage.js'

const GOAL_NOTE = {
  'сила': 'Силовая схема: упор на базу, тяжёлый вес, низкие повторы, длинный отдых.',
  'набор массы': 'Гипертрофия: умеренный вес и объём, отдых 60–90 сек.',
  'похудение': 'Жиросжигание: суперсеты по кругу, минимум отдыха, + кардио в конце.',
  'тонус': 'Тонус: многоповторка и суперсеты, + лёгкое кардио.'
}

export default function WorkoutBuilder({ program, profile, initialGroup, onChangeProgram }) {
  const [picked, setPicked] = useState([])
  const [session, setSession] = useState(null)
  const [saved, setSaved] = useState(false)
  const [guided, setGuided] = useState(false)
  const [routines, setRoutines] = useState(() => store.getRoutines())
  const favorites = store.getFavEx()
  useEffect(() => { if (initialGroup) { setPicked([initialGroup]); build([initialGroup], true) } }, [])

  const toggle = (g) => setPicked(p => p.includes(g) ? p.filter(x => x !== g) : [...p, g])

  function build(groups, varied) {
    if (!groups.length) return
    const g = generateSession({ groups, goal: profile.goal, level: profile.level, equip: profile.equip, favorites, varied })
    setSession({ ...g, ss: g.ss || [] })
    setSaved(false)
    setTimeout(() => document.getElementById('session')?.scrollIntoView({ behavior: 'smooth' }), 60)
  }
  function autoPick() {
    const preset = [...program.presets].sort((a, b) => presetFreshness(b.groups) - presetFreshness(a.groups))[0]
    setPicked(preset.groups); build(preset.groups, true)
  }
  function startRoutine(r) {
    setPicked(r.groups || [])
    setSession({ exercises: r.exercises, scheme: r.scheme, groups: r.groups, cardio: r.cardio, ss: r.ss || [] })
    setSaved(false)
    setTimeout(() => document.getElementById('session') && document.getElementById('session').scrollIntoView({ behavior: 'smooth' }), 60)
  }
  function saveRoutine() {
    const def = session.groups.map(g => GROUP_META[g].label).join(' + ')
    const name = window.prompt('Название своей тренировки:', def)
    if (!name) return
    setRoutines(store.addRoutine({ name, groups: session.groups, exercises: session.exercises, scheme: session.scheme, cardio: session.cardio, ss: session.ss || [] }))
  }
  function deleteRoutine(id) { setRoutines(store.removeRoutine(id)) }
  function regen() { if (session) build(session.groups, true) }
  function swap(i) {
    const ex = session.exercises[i]
    const alt = pickAlternative({ group: ex.group, equip: profile.equip, level: profile.level, excludeIds: session.exercises.map(e => e.id), favorites })
    if (!alt) return
    const exs = [...session.exercises]; exs[i] = shapeExercise(alt, session.scheme)
    setSession({ ...session, exercises: exs })
  }
  function toggleSS(i) {
    setSession(s => {
      const ss = new Set(s.ss || [])
      if (ss.has(i)) ss.delete(i)
      else { ss.add(i); ss.delete(i - 1); ss.delete(i + 1) } // не даём упражнению попасть в два суперсета
      return { ...s, ss: [...ss].sort((a, b) => a - b) }
    })
  }
  function saveWorkout() {
    if (saved) return
    const pr = store.getProgress()
    pr.workouts.push({ date: todayKey(), groups: session.groups, count: session.exercises.length })
    store.setProgress(pr); setSaved(true)
  }

  if (guided && session) {
    return <GuidedWorkout session={session} profile={profile} onFinish={saveWorkout} onExit={() => setGuided(false)} />
  }

  const place = profile.equip === 'gym' ? 'зал' : profile.equip === 'dumbbell' ? 'дом + гантели' : 'без инвентаря'

  return (
    <section className="block">
      <div className="block-head">
        <h2 className="display sm">Тренировка на сегодня</h2>
        <p className="sub">Программа: <b className="accent">{program.name}</b> · {place}.</p>
      </div>

      {routines.length > 0 && (
        <div className="routines">
          <span className="more-lbl" style={{ margin: '0 2px 8px' }}>Мои тренировки</span>
          {routines.map(r => (
            <div className="routine" key={r.id}>
              <button className="routine-main" onClick={() => startRoutine(r)}>
                <span className="routine-name">{r.name}</span>
                <span className="routine-sub">{(r.groups || []).map(g => GROUP_META[g].label).join(' · ')} · {r.exercises.length} упр</span>
              </button>
              <button className="routine-play" onClick={() => startRoutine(r)} aria-label="Запустить"><Icon name="play" size={16} /></button>
              <button className="delbtn" onClick={() => deleteRoutine(r.id)} aria-label="Удалить"><Icon name="trash" size={15} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="presets">
        {program.presets.map((p, i) => (
          <button key={i} className="preset" onClick={() => { setPicked(p.groups); build(p.groups, false) }}>{p.name}</button>
        ))}
      </div>

      <button className="cta auto-btn" onClick={autoPick}><Icon name="bolt" size={18} /> Собери тренировку за меня</button>

      <button className="textlink" onClick={onChangeProgram}><Icon name="refresh" size={15} /> Сменить программу</button>

      <div className="divider"><span>или вручную по группам</span></div>

      <div className="muscles">
        {GROUPS.map(g => (
          <button key={g} className={'muscle' + (picked.includes(g) ? ' on' : '')} style={{ '--mc': GROUP_META[g].color }} onClick={() => toggle(g)}>
            <img className="mcard-img" src={MUSCLE_ART[g]} alt="" />
            <Hl group={g} />
            <div className="mcard-scrim" />
            {picked.includes(g) && <span className="mcard-check"><Icon name="check" size={13} /></span>}
            <span className="m-name">{GROUP_META[g].label}</span>
          </button>
        ))}
      </div>

      <button className={'cta' + (picked.length ? '' : ' disabled')} disabled={!picked.length} onClick={() => build(picked, false)}>
        {picked.length ? 'Собрать тренировку (' + picked.length + ')' : 'Выбери хотя бы одну группу'}
      </button>

      {session && <Session session={session} profile={profile} saved={saved}
        onSave={saveWorkout} onGuide={() => setGuided(true)} onRegen={regen} onSwap={swap} onSaveRoutine={saveRoutine} onToggleSS={toggleSS} />}
    </section>
  )
}

function Session({ session, profile, saved, onSave, onGuide, onRegen, onSwap, onSaveRoutine, onToggleSS }) {
  const ssSet = new Set(session.ss || [])
  const stats = sessionStats(session)
  const last = session.exercises.length - 1
  return (
    <div id="session" className="session">
      <div className="session-head">
        <h3 className="display sm">Твоя тренировка</h3>
        <div className="chips">
          {session.groups.map(g => <span key={g} className="chip" style={chipStyle(g)}>{GROUP_META[g].label}</span>)}
        </div>
        <div className="sess-stats">
          <span><Icon name="clock" size={14} /> ≈{stats.mins} мин</span>
          <span><Icon name="grid" size={14} /> {stats.exs} упр</span>
          <span><Icon name="bolt" size={14} /> {stats.sets} подходов</span>
        </div>
        {GOAL_NOTE[profile.goal] && <p className="goal-note2"><Icon name="bolt" size={13} /> {GOAL_NOTE[profile.goal]}</p>}
        <div className="scheme">
          <div><span>Подходы</span><b>{session.scheme.sets}</b></div>
          <div><span>Повторы</span><b>{session.scheme.reps}</b></div>
          <div><span>Отдых</span><b>{session.scheme.rest}</b></div>
        </div>
      </div>

      <div className="session-actions">
        <button className="cta guide-btn" onClick={onGuide}><Icon name="play" size={18} /> Гид по шагам</button>
        <button className="iconbtn-lg" onClick={onRegen} aria-label="Другой вариант"><Icon name="refresh" size={20} /></button>
      </div>
      <p className="regen-hint">Не нравится подбор? Жми <Icon name="refresh" size={12} /> — соберём другой вариант, меняй упражнения по одному или связывай в суперсеты.</p>
      <button className="textlink save-routine" onClick={onSaveRoutine}><Icon name="plus" size={14} /> Сохранить как свою тренировку</button>

      {session.exercises.map((ex, i) => {
        const inSuper = ssSet.has(i) || ssSet.has(i - 1)
        return (
          <div key={ex.id}>
            <div className={'ex' + (inSuper ? ' ex-super' : '')}>
              <div className="ex-top">
                <span className="ex-thumb">
                  <img src={MUSCLE_ART[ex.group]} alt="" />
                  <Hl group={ex.group} />
                  <b className="ex-num">{i + 1}</b>
                </span>
                <div className="ex-main">
                  <div className="ex-row">
                    <span className="ex-name">{ex.name}</span>
                    <span className="ex-sets">{ex.sets}×{ex.reps}</span>
                  </div>
                  <div className="ex-meta">
                    <span className="tag" style={chipStyle(ex.group)}>{GROUP_META[ex.group].label}</span>
                    {ex.compound && <span className="tag base">база</span>}
                    {inSuper && <span className="tag ss-tag"><Icon name="bolt" size={11} /> суперсет</span>}
                    <span className="tag load">{estimateLoad(ex, profile)}</span>
                  </div>
                  <div className="ex-musc">{ex.muscles} · отдых {ex.rest}</div>
                </div>
                <button className="swapbtn" onClick={() => onSwap(i)} aria-label="Заменить"><Icon name="refresh" size={16} /></button>
              </div>
              <div className="ex-tip"><Icon name="info" size={14} /> {ex.tip}</div>
            </div>
            {i < last && (
              <div className="ss-link">
                <button className={'ss-btn' + (ssSet.has(i) ? ' on' : '')} onClick={() => onToggleSS(i)}>
                  {ssSet.has(i)
                    ? <><Icon name="bolt" size={13} /> Суперсет — без отдыха между</>
                    : <><Icon name="plus" size={13} /> Связать в суперсет со следующим</>}
                </button>
              </div>
            )}
          </div>
        )
      })}

      {session.cardio && (
        <div className="ex">
          <div className="ex-top">
            <span className="ex-thumb cardio"><Icon name="activity" size={18} /></span>
            <div className="ex-main">
              <div className="ex-row"><span className="ex-name">Кардио в конце</span><span className="ex-sets">15–20 мин</span></div>
              <div className="ex-tip"><Icon name="info" size={14} /> Лёгкий темп: ходьба, дорожка или велотренажёр.</div>
            </div>
          </div>
        </div>
      )}

      <p className="load-note">Веса — ориентир под твои параметры. Подбирай так, чтобы последние повторы давались тяжело, но с чистой техникой.</p>

      <button className={'cta' + (saved ? ' done' : '')} onClick={onSave} disabled={saved}>
        {saved ? <><Icon name="check" size={18} /> Тренировка засчитана</> : <><Icon name="check" size={18} /> Отметить выполненной</>}
      </button>
    </div>
  )
}

function chipStyle(group) {
  const c = GROUP_META[group].color
  const n = parseInt(c.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  return { background: 'rgba(' + r + ',' + g + ',' + b + ',0.2)', color: '#fff', border: '1px solid rgba(' + r + ',' + g + ',' + b + ',0.45)' }
}
