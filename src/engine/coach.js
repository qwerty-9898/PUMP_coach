// ИИ-тренер на правилах: советы по прогрессии, балансу и восстановлению из данных пользователя.
import { store, calcStreak } from '../storage.js'
import { coverageMap, recoveryDetail } from './recovery.js'
import { bodyBalance } from './progress.js'
import { GROUP_META } from './exercises.js'

export function coachTips(profile) {
  const tips = []
  const workouts = store.getProgress().workouts
  if (!workouts.length) {
    tips.push({ icon: 'bolt', tone: 'info', text: 'Начни с первой тренировки — собери её ниже и пройди в режиме «Гид по шагам».' })
    return tips
  }
  const streak = calcStreak(workouts.map(w => w.date))
  const cov = coverageMap(30)
  const trained = cov.filter(c => c.count > 0)
  const lastDate = workouts[workouts.length - 1].date
  const daysSinceLast = Math.floor((Date.now() - new Date(lastDate)) / 86400000)

  if (daysSinceLast >= 4) tips.push({ icon: 'flame', tone: 'warn', text: 'Не тренировался ' + daysSinceLast + ' дн. Вернись — даже короткая тренировка лучше нуля.' })
  else if (streak >= 3) tips.push({ icon: 'flame', tone: 'good', text: 'Серия ' + streak + ' дн — отличный режим, держи темп.' })

  if (trained.length >= 2) {
    const sorted = [...cov].sort((a, b) => a.count - b.count)
    const lag = sorted[0], top = sorted[sorted.length - 1]
    if (lag.count === 0 && top.count >= 2) tips.push({ icon: 'target', tone: 'warn', text: GROUP_META[lag.group].label + ' ни разу за месяц — добавь в ближайшую тренировку.' })
    else if (top.count - lag.count >= 4) tips.push({ icon: 'target', tone: 'info', text: GROUP_META[lag.group].label + ' отстаёт от группы «' + GROUP_META[top.group].label.toLowerCase() + '» — подтяни баланс.' })
  }

  const bal = bodyBalance(30)
  if (bal.total > 0) {
    if (bal.push > bal.pull * 1.6) tips.push({ icon: 'activity', tone: 'info', text: 'Толкающих заметно больше тянущих — добавь тяги на спину, чтобы не сутулиться.' })
    else if (bal.pull > bal.push * 1.6) tips.push({ icon: 'activity', tone: 'info', text: 'Тянущих больше толкающих — добавь жимы на грудь и плечи.' })
    if (bal.legs < bal.total * 0.2) tips.push({ icon: 'activity', tone: 'warn', text: 'Ноги в загоне — добавь день ног, это двигатель всего тела.' })
  }

  const fresh = recoveryDetail().filter(d => d.state !== 'recovering').map(d => GROUP_META[d.group].label)
  if (fresh.length && daysSinceLast < 4) tips.push({ icon: 'bolt', tone: 'good', text: 'Свежие и готовы сегодня: ' + fresh.slice(0, 3).join(', ') + '.' })

  return tips.slice(0, 4)
}
