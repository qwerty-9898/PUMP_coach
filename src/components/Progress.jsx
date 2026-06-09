import Icon from './Icon.jsx'
import { GROUP_META } from '../engine/exercises.js'
import { store, calcStreak } from '../storage.js'

export default function Progress() {
  const pr = store.getProgress()
  const workouts = [...pr.workouts].reverse()
  const streak = calcStreak(pr.workouts.map(w => w.date))
  const total = pr.workouts.length
  const week = pr.workouts.filter(w => withinDays(w.date, 7)).length

  return (
    <div className="screen">
      <div className="stats3">
        <div className="stat3"><Icon name="trophy" size={20} /><b>{streak}</b><span>серия, дней</span></div>
        <div className="stat3"><Icon name="activity" size={20} /><b>{week}</b><span>за 7 дней</span></div>
        <div className="stat3"><Icon name="dumbbell" size={20} /><b>{total}</b><span>всего</span></div>
      </div>

      <div className="block-head"><h2 className="display sm">История тренировок</h2></div>

      {workouts.length === 0 ? (
        <div className="empty">
          <Icon name="activity" size={32} />
          <p>Пока пусто. Собери тренировку в разделе «План» и отметь её выполненной — она появится здесь.</p>
        </div>
      ) : (
        <div className="histlist">
          {workouts.map((w, i) => (
            <div className="histitem" key={i}>
              <span className="hist-date">{fmt(w.date)}</span>
              <div className="hist-groups">
                {w.groups.map(g => <span key={g} className="chip">{GROUP_META[g]?.label || g}</span>)}
              </div>
              <span className="hist-count">{w.count} упр</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function withinDays(dateStr, days) {
  const d = new Date(dateStr), now = new Date()
  return (now - d) / 86400000 <= days
}
function fmt(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
