// Медали: регулярность, сила/рекорды, объём. Без повторяющихся механик.
import { store, calcStreak } from '../storage.js'
import { allRecords, exSeries } from './progress.js'

function within(dateStr, days) { return (Date.now() - new Date(dateStr).getTime()) / 86400000 <= days }

function maxGain() {
  let g = 0
  for (const id of store.loggedExIds()) {
    const s = exSeries(id)
    if (!s.length) continue
    const first = s[0].best
    const best = s.reduce((m, x) => Math.max(m, x.best), 0)
    g = Math.max(g, best - first)
  }
  return g
}

export function achievements() {
  const workouts = store.getProgress().workouts
  const total = workouts.length
  const streak = calcStreak(workouts.map(w => w.date))
  const week = workouts.filter(w => within(w.date, 7)).length
  const recs = allRecords().length
  const gain = maxGain()
  const logs = store.getLogs()
  const sets = logs.reduce((a, l) => a + (l.sets ? l.sets.length : 0), 0)
  const ton = logs.reduce((a, l) => a + l.sets.reduce((s, x) => s + (x.w || 0) * (x.r || 0), 0), 0)

  const defs = [
    // Регулярность
    { id: 'first',     icon: 'bolt',     cat: 'Регулярность', title: 'Первый шаг',     desc: 'Заверши свою первую тренировку',        value: total,  goal: 1 },
    { id: 'streak7',   icon: 'flame',    cat: 'Регулярность', title: 'Неделя огня',    desc: 'Тренируйся 7 дней подряд',              value: streak, goal: 7 },
    { id: 'weekfull',  icon: 'check',    cat: 'Регулярность', title: 'Полная неделя',  desc: 'Сделай 4 тренировки за 7 дней',         value: week,   goal: 4 },
    // Объём работы
    { id: 'w30',       icon: 'dumbbell', cat: 'Объём',        title: 'Тридцатка',      desc: 'Накопи 30 тренировок',                  value: total,  goal: 30 },
    { id: 'w100',      icon: 'trophy',   cat: 'Объём',        title: 'Сотня',          desc: 'Накопи 100 тренировок',                 value: total,  goal: 100 },
    { id: 'sets100',   icon: 'edit',     cat: 'Объём',        title: '100 подходов',   desc: 'Запиши 100 рабочих подходов с весом',   value: sets,   goal: 100 },
    { id: 'ton25',     icon: 'target',   cat: 'Объём',        title: '25 тонн',        desc: 'Подними 25 000 кг суммарного тоннажа',  value: ton,    goal: 25000 },
    // Сила и рекорды
    { id: 'pr1',       icon: 'star',     cat: 'Сила',         title: 'Личный рекорд',  desc: 'Поставь первый рекорд в упражнении',    value: recs,   goal: 1 },
    { id: 'gain10',    icon: 'activity', cat: 'Сила',         title: 'Сильнее на +10', desc: 'Прибавь 10 кг в любом упражнении',       value: Math.round(gain), goal: 10 }
  ]

  return defs.map(d => ({
    ...d,
    earned: d.value >= d.goal,
    progress: Math.max(0, Math.min(1, d.value / d.goal))
  }))
}

export function achievementsSummary() {
  const a = achievements()
  return { earned: a.filter(x => x.earned).length, total: a.length, list: a }
}
