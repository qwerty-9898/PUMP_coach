import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { store, calcStreak, todayKey } from '../storage.js'

const TIPS = [
  'Прогрессия нагрузки — главное. Добавляй вес или повтор, когда подход даётся легко.',
  'Сон 7–9 часов растит мышцы не хуже тренировок. Восстановление — часть прогресса.',
  'Белок 1.6–2.2 г на кг веса в день. Без него рост невозможен, как ни старайся.',
  'Техника важнее веса. Лучше чисто с лёгким, чем криво с тяжёлым и с травмой.',
  'Вода: 30 мл на кг веса. Обезвоживание режет силу и выносливость.',
  'Не пропускай ноги. Большие мышцы ног разгоняют общий рост и гормоны.',
  'Разминка 5–10 минут снижает риск травм и улучшает результат в подходах.',
  'Ешь профицит для массы и дефицит для сушки — но всегда держи белок высоким.',
  'Мышца растёт не на тренировке, а во сне и от еды. Тренировка — лишь стимул.',
  'Веди дневник: что не записано, тем не управляешь. Прогресс любит цифры.'
]

const CARDS = [
  { route: 'workout', icon: 'dumbbell', title: 'План тренировки', sub: 'Программа и тренировка на день' },
  { route: 'nutrition', icon: 'flame', title: 'Калории и КБЖУ', sub: 'Считай еду и БЖУ за день' },
  { route: 'catalog', icon: 'book', title: 'Каталог упражнений', sub: 'Техника и какие мышцы' },
  { route: 'progress', icon: 'activity', title: 'Прогресс', sub: 'Тренировки и серия' },
  { route: 'water', icon: 'droplet', title: 'Дневник воды', sub: 'Норма и учёт за день' },
  { route: 'measures', icon: 'ruler', title: 'Замеры тела', sub: 'Вес и объёмы' },
  { route: 'timer', icon: 'timer', title: 'Таймер отдыха', sub: 'Между подходами' },
  { route: 'calculators', icon: 'calc', title: 'Калькуляторы', sub: '1ПМ и блины на штангу' }
]

export default function Home({ profile, go, userName }) {
  const n = calcNutrition(profile)
  const date = todayKey()
  const [tipIdx, setTipIdx] = useState(() => new Date().getMinutes() % TIPS.length)

  useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 120000)
    return () => clearInterval(id)
  }, [])

  const streak = calcStreak(store.getProgress().workouts.map(w => w.date))
  const eaten = store.getFoodDay(date).reduce((a, e) => a + e.kcal, 0)
  const water = store.getWater()[date] || 0

  return (
    <div className="home">
      <div className="greet">
        <span className="greet-k">Погнали, {userName || 'чемпион'}</span>
        <h1 className="display lg">Сегодня прокачаемся</h1>
      </div>

      <div className="today">
        <button className="todaybox" onClick={() => go('nutrition')}>
          <Icon name="flame" size={18} />
          <b>{eaten}<small>/{n.kcal}</small></b><span>ккал съедено</span>
        </button>
        <button className="todaybox" onClick={() => go('water')}>
          <Icon name="droplet" size={18} />
          <b>{(water / 1000).toFixed(1)}<small> л</small></b><span>вода</span>
        </button>
        <button className="todaybox" onClick={() => go('progress')}>
          <Icon name="trophy" size={18} />
          <b>{streak}</b><span>серия</span>
        </button>
      </div>

      <div className="cards">
        {CARDS.map(c => (
          <button key={c.route} className="navcard" onClick={() => go(c.route)}>
            <span className="navcard-ic"><Icon name={c.icon} size={24} /></span>
            <span className="navcard-txt">
              <span className="navcard-title">{c.title}</span>
              <span className="navcard-sub">{c.sub}</span>
            </span>
            <span className="navcard-arr"><Icon name="chevron" size={18} /></span>
          </button>
        ))}
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
