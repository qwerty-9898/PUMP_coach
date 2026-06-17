// Оценка качества питания за день (0–100 + буква A–E) — объяснимая, без скрытой магии.
// Учитываем: добор белка, попадание в калории, долю жиров. Опираемся на то, что есть в данных (kcal/p/f/c).
export function dayScore(eaten, goals) {
  if (!eaten || eaten.kcal <= 0) return null
  const proteinGoal = goals.protein || 1
  const kcalGoal = goals.kcal || 1

  const pPart = Math.min(1, eaten.p / proteinGoal)                 // добор белка
  const kcalDiff = Math.abs(eaten.kcal - kcalGoal) / kcalGoal
  const kcalPart = Math.max(0, 1 - kcalDiff)                        // близость к цели по ккал
  const fatRatio = (eaten.f * 9) / Math.max(1, eaten.kcal)
  const fatPart = fatRatio <= 0.35 ? 1 : Math.max(0, 1 - (fatRatio - 0.35) / 0.35)

  const score = Math.round((pPart * 0.40 + kcalPart * 0.35 + fatPart * 0.25) * 100)
  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'E'
  const color = score >= 85 ? '#22c55e' : score >= 70 ? '#84cc16' : score >= 55 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  const tips = []
  if (pPart < 0.8) tips.push('Добавь белка — пока ' + Math.round(pPart * 100) + '% от цели (' + eaten.p + '/' + proteinGoal + ' г)')
  if (kcalDiff > 0.15) tips.push(eaten.kcal > kcalGoal ? 'Перебор по калориям на ' + (eaten.kcal - kcalGoal) + ' ккал' : 'Недобор по калориям на ' + (kcalGoal - eaten.kcal) + ' ккал')
  if (fatRatio > 0.40) tips.push('Многовато жиров (' + Math.round(fatRatio * 100) + '% калорий) — выбери что-то постнее')
  if (!tips.length) tips.push('Отличный баланс — так держать! 💪')

  return { score, grade, color, tips }
}
