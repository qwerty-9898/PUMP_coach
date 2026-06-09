// Расчёт калорий и БЖУ — формула Миффлина-Сан Жеора + активность + поправка под цель.
export function calcNutrition({ gender, age, weight, height, goal, daysPerWeek }) {
  const bmr = gender === 'мужской'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161
  const activity = daysPerWeek >= 5 ? 1.6 : daysPerWeek >= 3 ? 1.5 : 1.4
  const tdee = bmr * activity
  let target = tdee
  if (goal === 'похудение') target = tdee * 0.8
  else if (goal === 'набор массы') target = tdee * 1.12
  const protein = Math.round(weight * 1.8)
  const fat = Math.round(weight * 0.9)
  const kcal = Math.round(target)
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4))
  return { bmr: Math.round(bmr), tdee: Math.round(tdee), kcal, protein, fat, carbs }
}
