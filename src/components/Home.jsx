import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import CalendarStrip from './CalendarStrip.jsx'
import MuscleSheet from './MuscleSheet.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { PROGRAMS, recommendProgram, activeOrRecommended } from '../data/programs.js'
import { recoveryMap, freshFocus } from '../engine/recovery.js'
import { GROUP_META } from '../engine/exercises.js'
import { store, calcStreak, todayKey } from '../storage.js'

const TIPS = [
  'Жми на прогрессию: чуть тяжелее или на повтор больше, чем в прошлый раз. Рост живёт здесь.',
  'Спишь мало — мышцы стоят. 7–9 часов сна работают не хуже зала.',
  'Белок в каждый приём: 1.6–2.2 г на кг веса в день. Без кирпичей дом не построить.',
  'Техника бьёт вес. Чисто с лёгким лучше, чем криво с тяжёлым и с травмой.',
  'Пей воду: 30 мл на кг. Обезвоженная мышца слабеет на глазах.',
  'Ноги — твой движок. Качаешь их — растёт всё тело.',
  'Разминка 5 минут экономит недели без травм. Не пропускай.',
  'Не догнал план? Один подход лучше нуля. Просто начни.'
]
const PLACE = { gym: 'в зале', dumbbell: 'дома с гантелями', none: 'без инвентаря' }

export default function Home({ profile, go, onMuscle, onTrain, userName }) {
  const n = calcNutrition(profile)
  const date = todayKey()
  const [tipIdx, setTipIdx] = useState(() => new Date().getMinutes() % TIPS.length)
  const [sheetG, setSheetG] = useState(null)
  useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 120000)
    return () => clearInterval(id)
  }, [])

  const program = activeOrRecommended(profile, store.getActiveProgram())
  const streak = calcStreak(store.getProgress().workouts.map(w => w.date))
  const eaten = store.getFoodDay(date).reduce((a, e) => a + e.kcal, 0)
  const water = store.getWater()[date] || 0
  const did = store.getProgress().workouts.some(w => w.date === date)

  const firstRun = store.getProgress().workouts.length === 0
  const map = recoveryMap()
  const trainedCount = map.filter(m => m.days != null).length
  const focus = freshFocus(3)
  const focusReady = focus.filter(f => f.days == null || f.days >= 2)
  const readyPct = trainedCount ? Math.round(map.reduce((a, m) => a + (1 - m.load), 0) / map.length * 100) : 0
  const freshCount = map.filter(m => m.load < 0.4).length
  const tiredCount = map.filter(m => m.load >= 0.6).length
  const R = 27, CIRC = 2 * Math.PI * R

  return (
    <div className="home">
      <div className="greet">
        <span className="greet-k">Погнали, {userName || 'чемпион'}</span>
        <h1 className="display lg">Время прокачаться</h1>
      </div>

      {/* Восстановление мышц — чистый минимализм */}
      <div className="card recovery-card">
        <div className="rc-head">
          <span className="card-kicker"><Icon name="activity" size={15} /> Восстановление мышц</span>
          {trainedCount > 0 && <span className="card-meta">{trainedCount}/7</span>}
        </div>
        {trainedCount === 0 ? (
          <p className="recovery-hint">Проведи первую тренировку — здесь покажем, какие мышцы устали, а какие свежие и готовы к нагрузке.</p>
        ) : (
          <>
          <div className="rc-summary">
            <div className="rc-ring">
              <svg viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6" />
                <circle cx="32" cy="32" r="27" fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - readyPct / 100)} transform="rotate(-90 32 32)" />
              </svg>
              <span className="rc-ring-num">{readyPct}<small>%</small></span>
            </div>
            <div className="rc-sum-txt">
              <span className="rc-sum-lbl">Готовность к тренировке</span>
              <span className="rc-sum-sub">{freshCount} свежих · {tiredCount} устали</span>
            </div>
          </div>
          <div className="rc-list">
            {map.map(m => {
              const c = GROUP_META[m.group].color
              const ready = Math.round((1 - m.load) * 100)
              return (
                <button className="rc-row" key={m.group} onClick={() => setSheetG(m.group)}>
                  <span className="rc-dot" style={{ background: c }} />
                  <span className="rc-name">{GROUP_META[m.group].label}</span>
                  <span className="rc-bar"><i style={{ width: ready + '%', background: c }} /></span>
                  <span className="rc-status">{m.status}</span>
                </button>
              )
            })}
          </div>
          </>
        )}
        {focusReady.length > 0 && (
          <button className="focus-cta" onClick={() => go('workout')}>
            <div className="focus-txt">
              <span className="focus-lbl">Свежее всего сегодня</span>
              <span className="focus-groups">{focusReady.map(f => GROUP_META[f.group].label).join(' · ')}</span>
            </div>
            <Icon name="arrow" size={18} />
          </button>
        )}
      </div>

      {firstRun && (
        <button className="welcome" onClick={() => go('workout')}>
          <span className="welcome-ic"><Icon name="bolt" size={22} /></span>
          <div className="welcome-txt">
            <span className="welcome-h">Добро пожаловать в PUMP</span>
            <p>Проведи первую тренировку — карта тела загорится, пойдут серия, рекорды и медали.</p>
          </div>
          <Icon name="arrow" size={20} className="welcome-arr" />
        </button>
      )}

      {/* Главное действие — старт программы */}
      <button className="card herocard" onClick={() => go('workout')}>
        <div className="hero-glow" />
        <div className="hero-top">
          <span className="hero-kicker">{did ? 'Сегодня уже размялся' : 'Тренировка на сегодня'}</span>
          <Icon name="dumbbell" size={24} />
        </div>
        <div className="hero-name">{program.name}</div>
        <div className="hero-sub">{program.subtitle} · {profile.goal} · {PLACE[profile.equip]}</div>
        <div className="hero-cta">
          <span>{did ? 'Добить ещё раз' : 'Начать тренировку'}</span>
          <Icon name="arrow" size={20} />
        </div>
      </button>

      <CalendarStrip profile={profile} go={go} />

      <div className="today">
        <button className="todaybox" onClick={() => go('progress')}>
          <Icon name="trophy" size={18} /><b>{streak}</b><span>серия</span>
        </button>
        <button className="todaybox" onClick={() => go('nutrition')}>
          <Icon name="flame" size={18} /><b>{eaten}<small>/{n.kcal}</small></b><span>ккал</span>
        </button>
        <button className="todaybox" onClick={() => go('water')}>
          <Icon name="droplet" size={18} /><b>{(water / 1000).toFixed(1)}<small> л</small></b><span>вода</span>
        </button>
      </div>

      <div className="quick2">
        <button className="quickcard" onClick={() => go('catalog')}>
          <Icon name="book" size={22} /><span>Каталог<br /><small>техника упражнений</small></span>
        </button>
        <button className="quickcard" onClick={() => go('more')}>
          <Icon name="grid" size={22} /><span>Инструменты<br /><small>вода, замеры, таймер</small></span>
        </button>
      </div>

      <div className="tip2">
        <div className="tip2-head">
          <span className="tip2-ic"><Icon name="bolt" size={16} /></span>
          <span className="tip2-kicker">Совет дня</span>
        </div>
        <p key={tipIdx} className="tip2-text tip-anim">{TIPS[tipIdx]}</p>
      </div>

      {sheetG && (() => {
        const m = map.find(x => x.group === sheetG)
        return (
          <MuscleSheet group={sheetG} days={m && m.days} status={m && m.status}
            onClose={() => setSheetG(null)}
            onTrain={() => { setSheetG(null); onTrain(sheetG) }}
            onExercises={() => { setSheetG(null); onMuscle(sheetG) }} />
        )
      })()}
    </div>
  )
}
