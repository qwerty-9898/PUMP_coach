import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import CalendarStrip from './CalendarStrip.jsx'
import MuscleSheet from './MuscleSheet.jsx'
import MiniRing from './MiniRing.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { PROGRAMS, recommendProgram, activeOrRecommended } from '../data/programs.js'
import { recoveryMap, freshFocus, recoveryDetail } from '../engine/recovery.js'
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

export default function Home({ profile, go, onMuscle, onTrain, onPlan, userName }) {
  const n = calcNutrition(profile)
  const date = todayKey()
  const [tipIdx, setTipIdx] = useState(() => new Date().getMinutes() % TIPS.length)
  const [sheetG, setSheetG] = useState(null)
  const [moreH, setMoreH] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 120000)
    return () => clearInterval(id)
  }, [])

  const program = activeOrRecommended(profile, store.getActiveProgram())
  const streak = calcStreak(store.getProgress().workouts.map(w => w.date))
  const eaten = store.getFoodDay(date).reduce((a, e) => a + e.kcal, 0)
  const water = store.getWater()[date] || 0
  const did = store.getProgress().workouts.some(w => w.date === date)
  const eatenP = store.getFoodDay(date).reduce((a, e) => a + (e.p || 0), 0)
  const mg = store.getMacroGoal()
  const proteinGoal = (mg && mg.p) || n.protein
  const waterGoal = Math.round(profile.weight * 30)
  const route = [
    { icon: 'dumbbell', done: did, label: did ? 'Тренировка сделана' : 'Сделай тренировку', go: 'workout' },
    { icon: 'apple', done: eatenP >= Math.round(proteinGoal * 0.8), label: eatenP >= Math.round(proteinGoal * 0.8) ? 'Белок набран' : 'Добери белок · ' + eatenP + '/' + proteinGoal + ' г', go: 'nutrition' },
    { icon: 'droplet', done: water >= waterGoal, label: water >= waterGoal ? 'Вода в норме' : 'Попей воды · ' + (water / 1000).toFixed(1) + '/' + (waterGoal / 1000).toFixed(1) + ' л', go: 'water' }
  ]
  const routeDone = route.filter(r => r.done).length

  const firstRun = store.getProgress().workouts.length === 0
  const map = recoveryMap()
  const trainedCount = map.filter(m => m.days != null).length
  const focus = freshFocus(3)
  const focusReady = focus.filter(f => f.days == null || f.days >= 2)
  const detail = recoveryDetail()
  const freshCount = detail.filter(d => d.state !== 'recovering').length
  const readyPct = trainedCount ? Math.round(detail.reduce((a, d) => a + d.pct, 0) / detail.length * 20) * 5 : 100
  const CIRC = 2 * Math.PI * 27
  const weekday = new Date().toLocaleDateString('ru-RU', { weekday: 'long' })

  return (
    <div className="home">
      <div className="greet">
        <span className="greet-k">Сегодня · {weekday}</span>
        <h1 className="display lg">Привет, {userName || 'чемпион'}</h1>
      </div>

      <div className="card route-card">
        <div className="route-head">
          <span className="card-kicker"><Icon name="flag" size={15} /> Маршрут на сегодня</span>
          <span className="route-cnt">{routeDone}/3</span>
        </div>
        {route.map((r, i) => (
          <button className={'route-row' + (r.done ? ' done' : '')} key={i} onClick={() => go(r.go)}>
            <span className="route-ic"><Icon name={r.done ? 'check' : r.icon} size={15} /></span>
            <span className="route-l">{r.label}</span>
            {!r.done && <Icon name="chevronR" size={16} className="route-arr" />}
          </button>
        ))}
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

      <button className="plan-chip" onClick={() => (onPlan ? onPlan() : go('workout'))}>
        <span className="plan-chip-ic"><Icon name="flag" size={15} /></span>
        <span className="plan-chip-txt">План на 4 недели</span>
        <Icon name="chevronR" size={16} />
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
              <span className="rc-sum-sub">{freshCount} из {detail.length} групп готовы к нагрузке</span>
            </div>
          </div>
          <div className="mr-rings">
            {detail.map(d => {
              const col = d.pct < 0.4 ? '#ff4d4d' : d.pct < 0.85 ? '#f5a623' : '#22c55e'
              const tl = d.state === 'fresh' ? 'свежая' : d.state === 'ready' ? 'готова' : (d.hoursLeft >= 24 ? '~' + Math.round(d.hoursLeft / 24) + ' дн' : '~' + d.hoursLeft + ' ч')
              return <MiniRing key={d.group} pct={d.pct} color={col} center={Math.round(d.pct * 20) * 5} label={GROUP_META[d.group].label} sub={tl} onClick={() => setSheetG(d.group)} />
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

      <button className="more-toggle" onClick={() => setMoreH(v => !v)}>
        <Icon name="grid" size={15} /> {moreH ? 'Скрыть' : 'Инструменты и совет дня'}
        <Icon name={moreH ? 'chevron' : 'chevronR'} size={16} />
      </button>

      {moreH && (<>
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
      </>)}

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
