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

// ===== Суперсеты и статистика тренировки =====
// ss — массив индексов i, означающих, что упражнение i связано со следующим (i+1) в суперсет.
export function buildBlocks(exercises, ss = []) {
  const set = new Set(ss)
  const blocks = []
  let i = 0
  while (i < exercises.length) {
    if (set.has(i) && i + 1 < exercises.length) {
      blocks.push({ idxs: [i, i + 1], exs: [exercises[i], exercises[i + 1]], super: true })
      i += 2
    } else {
      blocks.push({ idxs: [i], exs: [exercises[i]], super: false })
      i += 1
    }
  }
  return blocks
}

// Последовательность «слотов» (подходов) внутри блока: для суперсета чередуем A,B по раундам.
export function blockSlots(block) {
  const maxSets = Math.max(...block.exs.map(e => e.sets || 0))
  const slots = []
  for (let r = 0; r < maxSets; r++) {
    block.exs.forEach((e, k) => {
      if (r < (e.sets || 0)) slots.push({ sub: k, exIdx: block.idxs[k], ex: e, round: r })
    })
  }
  return slots
}

export function restSeconds(rest) {
  const num = parseInt((rest || '').replace(/[^0-9].*$/, ''), 10) || 60
  return /мин/.test(rest) ? num * 60 : num
}

// Оценка длительности и объёма тренировки.
export function sessionStats(session) {
  const rs = restSeconds(session.scheme && session.scheme.rest)
  const ssSet = new Set(session.ss || [])
  let totalSets = 0, sec = 0
  session.exercises.forEach((ex, i) => {
    totalSets += ex.sets
    const isSecondOfSuper = ssSet.has(i - 1)
    // в суперсете второй экземпляр не добавляет отдельный отдых (отдых после пары)
    const restPer = isSecondOfSuper ? 0 : rs
    sec += ex.sets * (45 + restPer)
  })
  sec += 5 * 60 // разминка
  if (session.cardio) sec += 18 * 60
  const mins = Math.max(10, Math.round(sec / 60 / 5) * 5)
  return { sets: totalSets, mins, exs: session.exercises.length }
}
