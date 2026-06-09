import { buildWeek } from '../data/programs.js'

export default function WeekSchedule({ program, profile }) {
  const week = buildWeek(program, profile.daysPerWeek)
  return (
    <div className="weekcard">
      <span className="flabel">Расписание недели · {program.name}</span>
      <div className="weekrows">
        {week.map((d, i) => (
          <div className={'weekrow' + (d.rest ? ' rest' : '')} key={i}>
            <span className="week-day">{d.day}</span>
            <span className="week-label">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="week-hint">Дни тренировок расставлены с днями отдыха для восстановления. Меняй любой день вручную ниже.</p>
    </div>
  )
}
