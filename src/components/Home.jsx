import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import CalendarStrip from './CalendarStrip.jsx'
import BodyHeatmap from './BodyHeatmap.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
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

export default function Home({ profile, go, userName }) {
  const n = calcNutrition(profile)
  const date = todayKey()
  const [tipIdx, setTipIdx] = useState(() => new Date().getMinutes() % TIPS.length)
  useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 120000)
    return () => clearInterval(id)
  }, [])

  const program = PROGRAMS.find(p => p.id === recommendProgram(profile))
  const streak = calcStreak(store.getProgress().workouts.map(w => w.date))
  const eaten = store.getFoodDay(date).reduce((a, e) => a + e.kcal, 0)
  const water = store.getWater()[date] || 0
  const did = store.getProgress().workouts.some(w => w.date === date)

  const map = recoveryMap()
  const trainedCount = map.filter(m => m.days != null).length
  const focus = freshFocus(3)
  const focusReady = focus.filter(f => f.days == null || f.days >= 2)

  return (
    <div className="home">
      <div className="greet">
        <span className="greet-k">Погнали, {userName || 'чемпион'}</span>
        <h1 className="display lg">Время прокачаться</h1>
      </div>

      {/* Карта восстановления — центральный блок */}
      <div className="card recovery">
        <div className="card-head">
          <span className="card-kicker"><Icon name="activity" size={15} /> Карта восстановления</span>
          {trainedCount > 0 && <span className="card-meta">{trainedCount} из 7 групп</span>}
        </div>

        <BodyHeatmap onPick={() => go('workout')} />

        {trainedCount === 0 ? (
          <p className="recovery-hint">Здесь оживёт карта твоего тела. Проведи первую тренировку — мышцы загорятся по нагрузке, а тусклые подскажут, что качать дальше.</p>
        ) : (
          <div className="rg-grid">
            {map.map(m => (
              <div className="rg" key={m.group}>
                <span className="rg-dot" style={{ background: GROUP_META[m.group].color, opacity: 0.3 + m.load * 0.7 }} />
                <span className="rg-name">{GROUP_META[m.group].label}</span>
                <span className="rg-st">{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {focusReady.length > 0 && (
          <button className="focus-cta" onClick={() => go('workout')}>
            <div className="focus-txt">
              <span className="focus-lbl">Сегодня свежее всего</span>
              <span className="focus-groups">{focusReady.map(f => GROUP_META[f.group].label).join(' · ')}</span>
            </div>
            <Icon name="arrow" size={18} />
          </button>
        )}
      </div>

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
    </div>
  )
}
