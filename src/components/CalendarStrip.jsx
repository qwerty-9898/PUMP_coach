import { recommendProgram, PROGRAMS, buildWeek, activeOrRecommended } from '../data/programs.js'
import { store, todayKey } from '../storage.js'

const WD = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

export default function CalendarStrip({ profile, go }) {
  const today = new Date()
  const dow = (today.getDay() + 6) % 7 // 0=Mon
  const monday = new Date(today); monday.setDate(today.getDate() - dow)

  const program = activeOrRecommended(profile, store.getActiveProgram())
  const week = buildWeek(program, profile.daysPerWeek)
  const done = new Set(store.getProgress().workouts.map(w => w.date))
  const tKey = todayKey()

  const days = WD.map((wd, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    const isToday = key === tKey
    const trains = !week[i].rest
    let status = 'rest'
    if (done.has(key)) status = 'done'
    else if (trains && key < tKey) status = 'skipped'
    else if (trains) status = 'planned'
    return { num: d.getDate(), wd, isToday, status, label: week[i].label }
  })

  return (
    <div className="calstrip">
      <div className="cal-head">Сегодня</div>
      <div className="cal-row">
        {days.map((d, i) => (
          <button key={i} className={'cal-day' + (d.isToday ? ' today' : '')} onClick={() => go('workout')}>
            <span className="cal-wd">{d.wd}</span>
            <span className={'cal-circle ' + d.status}>{d.num}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
