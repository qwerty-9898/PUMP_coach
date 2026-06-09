import { EXERCISES, levelGE } from './exercises.js'

export const SCHEME = {
  'похудение':   { sets: 3, reps: '12–15', rest: '45–60 сек', cardio: true },
  'набор массы': { sets: 4, reps: '8–12',  rest: '60–90 сек', cardio: false },
  'сила':        { sets: 5, reps: '4–6',   rest: '2–3 мин',   cardio: false },
  'тонус':       { sets: 3, reps: '12–15', rest: '45–60 сек', cardio: true }
}

function allowedEquip(equip) {
  return equip === 'gym' ? ['none', 'dumbbell', 'gym']
    : equip === 'dumbbell' ? ['none', 'dumbbell']
    : ['none']
}

function perGroupCount(nGroups, level) {
  let n = nGroups <= 2 ? 3 : nGroups <= 4 ? 2 : 1
  if (level === 'новичок') n = Math.min(n, 2)
  return n
}

function pickForGroup(group, equip, level, count) {
  const allowed = allowedEquip(equip)
  let pool = EXERCISES.filter(e =>
    e.group === group && allowed.includes(e.equip) && levelGE(level, e.level))
  if (pool.length === 0) {
    pool = EXERCISES.filter(e => e.group === group && allowed.includes(e.equip))
  }
  pool.sort((a, b) => {
    if (a.compound !== b.compound) return a.compound ? -1 : 1
    return allowed.indexOf(b.equip) - allowed.indexOf(a.equip)
  })
  return pool.slice(0, count)
}

export function generateSession({ groups, goal, level, equip }) {
  const scheme = SCHEME[goal] || SCHEME['тонус']
  const uniq = [...new Set(groups)]
  const count = perGroupCount(uniq.length, level)

  let picked = []
  for (const g of uniq) picked.push(...pickForGroup(g, equip, level, count))

  const seen = new Set()
  picked = picked.filter(e => (seen.has(e.id) ? false : seen.add(e.id)))
  picked.sort((a, b) => (a.compound === b.compound ? 0 : a.compound ? -1 : 1))

  const exercises = picked.map(e => ({
    id: e.id, name: e.name, group: e.group, compound: e.compound, equip: e.equip,
    muscles: e.muscles, sets: scheme.sets, reps: scheme.reps, rest: scheme.rest, tip: e.tip
  }))

  return { exercises, scheme, groups: uniq, cardio: scheme.cardio }
}
