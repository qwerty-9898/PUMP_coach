import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import CalendarStrip from './CalendarStrip.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store, calcStreak, todayKey } from '../storage.js'

const TIPS = [
  'Прогрессия нагрузки — главное. Добавляй вес или повтор, когда подход даётся легко.',
  'Сон 7–9 часов растит мышцы не хуже тренировок. Восстановление — часть прогресса.',
  'Белок 1.6–2.2 г на кг веса в день. Без него рост невозможен, как ни старайся.',
  'Техника важнее веса. Лучше чисто с лёгким, чем криво с тяжёлым и с травмой.',
  'Вода: 30 мл на кг веса. Обезвоживание режет силу и выносливость.',
  'Не пропускай ноги. Большие мышцы ног разгоняют общий рост и гормоны.',
  'Разминка 5–10 минут снижает риск травм и улучшает результат в подходах.',
  'Мышца растёт не на тренировке, а во сне и от еды. Тренировка — лишь стимул.'
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

  return (
    <div className="home">
      <div className="greet">
        <span className="greet-k">Погнали, {userName || 'чемпион'}</span>
        <h1 className="display lg">Время прокачаться</h1>
      </div>

      <CalendarStrip profile={profile} go={go} />

      <button className="herocard" onClick={() => go('workout')}>
        <div className="hero-glow" />
        <div className="hero-top">
          <span className="hero-kicker">{did ? 'Сегодня уже размялся' : 'Тренировка на сегодня'}</span>
          <Icon name="dumbbell" size={26} />
        </div>
        <div className="hero-name">{program.name}</div>
        <div className="hero-sub">{program.subtitle} · {profile.goal} · {PLACE[profile.equip]}</div>
        <div className="hero-cta">
          <span>{did ? 'Добить ещё раз' : 'Начать тренировку'}</span>
          <Icon name="arrow" size={20} />
        </div>
      </button>

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

      <div className="tipcard">
        <span className="tip-ic"><Icon name="info" size={18} /></span>
        <div>
          <span className="tip-h">Совет дня</span>
          <p key={tipIdx} className="tip-anim">{TIPS[tipIdx]}</p>
        </div>
      </div>
    </div>
  )
}
