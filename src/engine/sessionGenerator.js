import { EXERCISES, levelGE } from './exercises.js'

export const SCHEME = {
  'похудение':   { sets: 3, reps: '12–15', rest: '45–60 сек', cardio: true },
  'набор массы': { sets: 4, reps: '8–12',  rest: '60–90 сек', cardio: false },
  'сила':        { sets: 5, reps: '4–6',   rest: '2–3 мин',   cardio: false },
  'тонус':       { sets: 3, reps: '12–15', rest: '45–60 сек', cardio: true }
}

function allowedEquip(equip) {
  // Строго по инвентарю: зал не предлагает упражнения «с весом тела/дома»
  // порядок = приоритет (предпочтительный инвентарь последним); зал без «веса тела»
  return equip === 'gym' ? ['dumbbell', 'gym']
    : equip === 'dumbbell' ? ['none', 'dumbbell']
    : ['none']
}
function perGroupCount(n, level) {
  let c = n <= 2 ? 3 : n <= 4 ? 2 : 1
  if (level === 'новичок') c = Math.min(c, 2)
  return c
}
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }

function eligible(group, equip, level) {
  const allowed = allowedEquip(equip)
  let pool = EXERCISES.filter(e => e.group === group && allowed.includes(e.equip) && levelGE(level, e.level))
  if (pool.length === 0) pool = EXERCISES.filter(e => e.group === group && allowed.includes(e.equip))
  return { pool, allowed }
}

function pickForGroup(group, equip, level, count, favSet, varied) {
  let { pool, allowed } = eligible(group, equip, level)
  if (varied) pool = shuffle(pool)
  pool.sort((a, b) => {
    const fa = favSet.has(a.id), fb = favSet.has(b.id)
    if (fa !== fb) return fa ? -1 : 1
    if (a.compound !== b.compound) return a.compound ? -1 : 1
    return allowed.indexOf(b.equip) - allowed.indexOf(a.equip)
  })
  return pool.slice(0, count)
}

function shape(e, scheme) {
  return { id: e.id, name: e.name, group: e.group, compound: e.compound, equip: e.equip,
    muscles: e.muscles, sets: scheme.sets, reps: scheme.reps, rest: scheme.rest, tip: e.tip }
}

export function generateSession({ groups, goal, level, equip, favorites = [], varied = false }) {
  const scheme = SCHEME[goal] || SCHEME['тонус']
  const uniq = [...new Set(groups)]
  const count = perGroupCount(uniq.length, level)
  const favSet = new Set(favorites)

  let picked = []
  for (const g of uniq) picked.push(...pickForGroup(g, equip, level, count, favSet, varied))
  const seen = new Set()
  picked = picked.filter(e => (seen.has(e.id) ? false : seen.add(e.id)))
  picked.sort((a, b) => (a.compound === b.compound ? 0 : a.compound ? -1 : 1))

  return { exercises: picked.map(e => shape(e, scheme)), scheme, groups: uniq, cardio: scheme.cardio }
}

// Подбор замены упражнения на ту же группу (не из уже использованных)
export function pickAlternative({ group, equip, level, excludeIds = [], favorites = [] }) {
  const { pool } = eligible(group, equip, level)
  const ex = new Set(excludeIds), favSet = new Set(favorites)
  let cand = pool.filter(e => !ex.has(e.id))
  if (cand.length === 0) cand = pool
  cand = shuffle(cand)
  cand.sort((a, b) => (favSet.has(b.id) ? 1 : 0) - (favSet.has(a.id) ? 1 : 0))
  return cand[0] || null
}

export function shapeExercise(e, scheme) { return shape(e, scheme) }
