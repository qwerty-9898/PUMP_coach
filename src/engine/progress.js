import { store } from '../storage.js'

export function e1rm(w, r) { return Math.round((w || 0) * (1 + (r || 0) / 30)) }
function round2(x) { return Math.round(x / 2.5) * 2.5 }
function weekKey(dateStr) {
  const d = new Date(dateStr); const day = (d.getDay() + 6) % 7
  const mon = new Date(d); mon.setDate(d.getDate() - day)
  return mon.toISOString().slice(0, 10)
}

// Серия по упражнению: на каждую дату — лучший вес, повторы, объём, 1ПМ
export function exSeries(exId) {
  return store.getExLogs(exId).map(l => {
    const best = l.sets.reduce((m, s) => Math.max(m, s.w || 0), 0)
    const bestSet = l.sets.reduce((b, s) => ((s.w > b.w) || (s.w === b.w && s.r > b.r)) ? s : b, { w: 0, r: 0 })
    const vol = l.sets.reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0)
    return { date: l.date, best, bestReps: bestSet.r, vol: Math.round(vol), e1rm: e1rm(bestSet.w, bestSet.r) }
  })
}

export function personalRecord(exId) {
  const s = exSeries(exId); if (!s.length) return null
  return s.reduce((m, x) => x.e1rm > m.e1rm ? x : m, s[0])
}

export function allRecords() {
  return store.loggedExIds().map(id => {
    const logs = store.getExLogs(id)
    const pr = personalRecord(id)
    return { exId: id, name: logs[0]?.name || id, group: logs[0]?.group, pr }
  }).filter(r => r.pr && r.pr.best > 0)
}

export function weeklyVolume() {
  const logs = store.getLogs(); const map = {}
  for (const l of logs) {
    const wk = weekKey(l.date)
    const v = l.sets.reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0)
    map[wk] = (map[wk] || 0) + v
  }
  return Object.entries(map).sort().map(([week, vol]) => ({ week, vol: Math.round(vol) }))
}

// Подсказка следующего подхода по прошлой тренировке
export function suggestNext(exId, repsStr) {
  const s = exSeries(exId); if (!s.length) return null
  const last = s[s.length - 1]
  if (!last.best) return null
  const parts = (repsStr || '').split(/[–-]/)
  const top = parseInt(parts[parts.length - 1]) || 12
  const low = parseInt(parts[0]) || top
  if (last.bestReps >= top) return { weight: round2(last.best + 2.5), reps: low, note: 'Добавь вес' }
  return { weight: last.best, reps: Math.min(last.bestReps + 1, top), note: 'Добавь повтор' }
}

export function lastSummary(exId) {
  const sets = store.getLastSets(exId)
  if (!sets) return null
  return sets.map(s => (s.w ? s.w : 'свой') + '×' + s.r).join(', ')
}

export function isPR(exId, w, r) {
  const pr = personalRecord(exId)
  return !pr || e1rm(w, r) > pr.e1rm
}
