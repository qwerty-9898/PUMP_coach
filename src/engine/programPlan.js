// 4-недельный мезоцикл с прогрессией под цель пользователя.
import { SCHEME } from './sessionGenerator.js'
import { PROGRAMS, recommendProgram, buildWeek } from '../data/programs.js'
import { store } from '../storage.js'

const WEEKS = [
  { title: 'Втягивающая', tag: 'Адаптация', note: 'Рабочие веса умеренные — оставляй 2–3 повтора в запасе. Главное на этой неделе техника. Обязательно запиши рабочие веса.' },
  { title: 'Объём', tag: 'Накопление', note: '+1 повтор в каждом рабочем подходе или +1 подход к базовым упражнениям. Вес держим тот же, что на 1-й неделе.' },
  { title: 'Интенсивность', tag: 'Пик', note: '+2.5–5% к рабочим весам. Повторы по нижней границе диапазона, в запасе 1–2 повтора. Самая тяжёлая неделя.' },
  { title: 'Разгрузка', tag: 'Делоуд', note: 'Веса −20%, минус один подход. Тело восстанавливается и закрепляет прогресс — со следующего цикла снова в рост.' }
]

function lowReps(reps) {
  const m = String(reps || '').match(/(\d+)/)
  return m ? m[1] : reps
}

function schemeFor(base, i) {
  if (i === 0) return base.sets + '×' + base.reps
  if (i === 1) return base.sets + '×' + base.reps + ' (+1 повтор)'
  if (i === 2) return base.sets + '×' + lowReps(base.reps) + ' · вес +2.5–5%'
  return Math.max(2, base.sets - 1) + '×' + base.reps + ' · лёгкие'
}

export function buildMesocycle(profile, programId) {
  const pid = programId || store.getActiveProgram() || recommendProgram(profile)
  const program = PROGRAMS.find(p => p.id === pid) || PROGRAMS[0]
  const base = SCHEME[profile.goal] || SCHEME['тонус']
  const days = profile.daysPerWeek || 3
  const week = buildWeek(program, days)
  const weeks = WEEKS.map((w, i) => ({ n: i + 1, ...w, scheme: schemeFor(base, i), deload: i === 3 }))
  return { program, week, weeks, goal: profile.goal, daysPerWeek: days, base }
}
