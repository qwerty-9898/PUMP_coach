// Карта восстановления мышц: насколько свежа каждая группа.
// load 1 = тренировал сегодня (горит), 0 = давно/никогда (свежее, пора грузить).
import { store } from '../storage.js'
import { EXERCISES, GROUPS } from './exercises.js'

const EX_GROUP = Object.fromEntries(EXERCISES.map(e => [e.id, e.group]))
const RECOVER_DAYS = 4 // за столько дней мышца «остывает» до свежей

function daysSince(dateStr) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

// Последняя дата тренировки каждой группы — из тренировок и из логов подходов
function lastDates() {
  const last = {}
  const touch = (g, date) => { if (!g) return; if (!last[g] || date > last[g]) last[g] = date }
  for (const w of store.getProgress().workouts) {
    for (const g of (w.groups || [])) touch(g, w.date)
  }
  for (const l of store.getLogs()) {
    touch(l.group || EX_GROUP[l.exId], l.date)
  }
  return last
}

export function statusOf(days) {
  if (days == null) return 'не качал'
  if (days <= 0) return 'нагружена сегодня'
  if (days === 1) return 'восстанавливается'
  if (days < RECOVER_DAYS) return days + ' дн. отдыха'
  return 'свежая, пора грузить'
}

// По всем группам: {group, days, load 0..1, status}
export function recoveryMap() {
  const last = lastDates()
  return GROUPS.map(g => {
    const date = last[g]
    const days = date == null ? null : daysSince(date)
    const load = days == null ? 0 : Math.max(0, Math.min(1, 1 - days / RECOVER_DAYS))
    return { group: g, days, load, status: statusOf(days) }
  })
}

// Что качать сегодня: самые свежие/давние группы (низкий load), не качанные — вперёд
export function freshFocus(limit = 3) {
  return [...recoveryMap()]
    .sort((a, b) => {
      const an = a.days == null ? 999 : a.days
      const bn = b.days == null ? 999 : b.days
      return bn - an
    })
    .slice(0, limit)
}
