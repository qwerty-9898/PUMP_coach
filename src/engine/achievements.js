// Ачивки/медали: считаются из тренировок и логов подходов.
import { store, calcStreak } from '../storage.js'
import { EXERCISES } from './exercises.js'
import { allRecords } from './progress.js'

const EX_GROUP = Object.fromEntries(EXERCISES.map(e => [e.id, e.group]))

function totalTonnage() {
  return store.getLogs().reduce((a, l) =>
    a + l.sets.reduce((s, x) => s + (x.w || 0) * (x.r || 0), 0), 0)
}
function trainedGroups() {
  const s = new Set()
  for (const w of store.getProgress().workouts) for (const g of (w.groups || [])) s.add(g)
  for (const l of store.getLogs()) { const g = l.group || EX_GROUP[l.exId]; if (g) s.add(g) }
  return s
}

// Определения: value(текущее) и goal(порог). earned = value>=goal.
export function achievements() {
  const workouts = store.getProgress().workouts
  const total = workouts.length
  const streak = calcStreak(workouts.map(w => w.date))
  const ton = totalTonnage()
  const groups = trainedGroups().size
  const recs = allRecords().length
  const logged = store.getLogs().length

  const defs = [
    { id: 'first',     icon: 'bolt',     title: 'Первый шаг',        desc: 'Проведи первую тренировку',        value: total,   goal: 1 },
    { id: 'log1',      icon: 'edit',     title: 'В деле',            desc: 'Запиши первый подход с весом',     value: logged,  goal: 1 },
    { id: 'streak3',   icon: 'flame',    title: 'В ритме',           desc: 'Серия 3 дня подряд',               value: streak,  goal: 3 },
    { id: 'streak7',   icon: 'flame',    title: 'Несгибаемый',       desc: 'Серия 7 дней подряд',              value: streak,  goal: 7 },
    { id: 'w10',       icon: 'dumbbell', title: 'Завсегдатай',       desc: '10 тренировок всего',              value: total,   goal: 10 },
    { id: 'w25',       icon: 'dumbbell', title: 'Старожил зала',     desc: '25 тренировок всего',              value: total,   goal: 25 },
    { id: 'allbody',   icon: 'activity', title: 'Всё тело',          desc: 'Прокачай все 7 групп мышц',        value: groups,  goal: 7 },
    { id: 'recs5',     icon: 'trophy',   title: 'Рекордсмен',        desc: '5 личных рекордов в упражнениях',  value: recs,    goal: 5 },
    { id: 'ton10',     icon: 'target',   title: '10 тонн',           desc: 'Подними 10 000 кг суммарно',       value: ton,     goal: 10000 },
    { id: 'ton50',     icon: 'target',   title: 'Полста тонн',       desc: 'Подними 50 000 кг суммарно',       value: ton,     goal: 50000 }
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
