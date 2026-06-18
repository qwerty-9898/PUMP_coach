// Персональные инсайты по дню питания.
export function dayInsights(eaten, goals) {
  const out = []
  const protein = goals.protein || 0
  const kcal = goals.kcal || 0
  const remaining = kcal - eaten.kcal
  if (eaten.kcal <= 0) {
    out.push({ tone: 'info', text: 'Запиши первый приём — здесь появятся персональные советы по дню.' })
    return out
  }
  const pGap = protein - eaten.p
  if (pGap > 15) out.push({ tone: 'warn', text: 'Добери белок: ещё ~' + pGap + ' г. Зайдут творог, курица, яйца или протеин.' })
  else out.push({ tone: 'good', text: 'Белок в норме (' + eaten.p + '/' + protein + ' г) — мышцы сыты.' })

  if (remaining > 150) out.push({ tone: 'info', text: 'Осталось ' + remaining + ' ккал — хватит на полноценный приём.' })
  else if (remaining < -120) out.push({ tone: 'warn', text: 'Перебор на ' + Math.abs(remaining) + ' ккал. Завтра чуть строже или добавь активности.' })
  else out.push({ tone: 'good', text: 'Калории в цель — отличный баланс на сегодня.' })

  const fatKcal = eaten.f * 9
  if (eaten.kcal > 0 && fatKcal / eaten.kcal > 0.42) out.push({ tone: 'warn', text: 'Многовато жиров (' + Math.round(fatKcal / eaten.kcal * 100) + '% калорий) — выбирай что-то постнее.' })

  return out.slice(0, 3)
}
