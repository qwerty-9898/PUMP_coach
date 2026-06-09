// Ориентировочный рабочий вес под параметры пользователя.
// Грубая оценка: доля от веса тела * множитель уровня. Это ОРИЕНТИР, не точная цифра.

const LEVEL_MULT = { 'новичок': 0.62, 'средний': 1.0, 'продвинутый': 1.35 }

// Базовая доля от массы тела для рабочего подхода (средний уровень)
function baseFactor(ex) {
  const g = ex.group, comp = ex.compound
  if (g === 'ноги') return comp ? 1.0 : 0.4
  if (g === 'спина') return comp ? 0.6 : 0.35
  if (g === 'грудь') return comp ? 0.6 : 0.3
  if (g === 'плечи') return comp ? 0.4 : 0.12
  if (g === 'бицепс' || g === 'трицепс') return comp ? 0.4 : 0.22
  return 0.2
}

function round2_5(x) { return Math.max(2.5, Math.round(x / 2.5) * 2.5) }

// Возвращает строку с ориентиром веса
export function estimateLoad(ex, profile) {
  if (ex.equip === 'none') return 'вес тела'
  const bw = profile.weight || 75
  const mult = LEVEL_MULT[profile.level] || 1.0
  const total = bw * baseFactor(ex) * mult
  if (ex.equip === 'dumbbell') {
    const perHand = round2_5(total / 2)
    return '≈ ' + fmt(perHand) + ' кг/рука'
  }
  return '≈ ' + fmt(round2_5(total)) + ' кг'
}

function fmt(x) { return Number.isInteger(x) ? x : x.toFixed(1) }
