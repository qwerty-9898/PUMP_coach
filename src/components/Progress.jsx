import { useState } from 'react'
import Icon from './Icon.jsx'
import GroupBadge from './GroupBadge.jsx'
import { EXERCISES, GROUPS, GROUP_META } from '../engine/exercises.js'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store, calcStreak } from '../storage.js'

export default function Progress({ profile }) {
  const pr = store.getProgress()
  const workouts = [...pr.workouts].reverse()
  const streak = calcStreak(pr.workouts.map(w => w.date))
  const total = pr.workouts.length
  const week = pr.workouts.filter(w => within(w.date, 7)).length

  const recId = recommendProgram(profile)
  const program = PROGRAMS.find(p => p.id === recId)
  const [stars, setStars] = useState(() => store.getRating()[recId] || 0)
  const [favGroup, setFavGroup] = useState(null)
  const [fav, setFav] = useState(() => store.getFavEx())

  function rate(s) { setStars(s); store.setRating(recId, s) }
  function toggleFav(id) { setFav(store.toggleFavEx(id)) }

  const allowed = profile.equip === 'gym' ? ['none', 'dumbbell', 'gym'] : profile.equip === 'dumbbell' ? ['none', 'dumbbell'] : ['none']

  return (
    <div className="screen">
      <div className="stats3">
        <div className="stat3"><Icon name="trophy" size={20} /><b>{streak}</b><span>серия, дней</span></div>
        <div className="stat3"><Icon name="activity" size={20} /><b>{week}</b><span>за 7 дней</span></div>
        <div className="stat3"><Icon name="dumbbell" size={20} /><b>{total}</b><span>всего</span></div>
      </div>

      <div className="ratecard">
        <span className="flabel">Моя программа</span>
        <div className="rate-name">{program.name}</div>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} className={'star' + (s <= stars ? ' on' : '')} onClick={() => rate(s)} aria-label={'Оценка ' + s}>
              <Icon name="star" size={28} />
            </button>
          ))}
        </div>
        <p className="rate-hint">{stars ? 'Спасибо за оценку! Учтём в развитии.' : 'Оцени, насколько программа тебе заходит.'}</p>
      </div>

      <div className="block-head"><h2 className="display sm">Любимые упражнения</h2>
        <p className="sub">Отметь любимые — генератор будет ставить их в приоритет при сборке тренировки.</p></div>
      <div className="favchips">
        {GROUPS.map(g => (
          <button key={g} className={'favchip' + (favGroup === g ? ' on' : '')} onClick={() => setFavGroup(favGroup === g ? null : g)}>
            {GROUP_META[g].label}
          </button>
        ))}
      </div>
      {favGroup && (
        <div className="exlist" style={{ marginTop: 12 }}>
          {EXERCISES.filter(e => e.group === favGroup && allowed.includes(e.equip)).map(e => (
            <button className="exrow" key={e.id} onClick={() => toggleFav(e.id)}>
              <div className="exrow-main">
                <span className="exrow-name">{e.name}</span>
                <span className="exrow-sub">{e.compound ? 'база' : 'изоляция'}</span>
              </div>
              <span className={'favstar' + (fav.includes(e.id) ? ' on' : '')}><Icon name="star" size={20} /></span>
            </button>
          ))}
        </div>
      )}

      <div className="block-head" style={{ marginTop: 22 }}><h2 className="display sm">История тренировок</h2></div>
      {workouts.length === 0 ? (
        <div className="empty"><Icon name="activity" size={32} /><p>Пока пусто. Отметь тренировку выполненной — она появится здесь.</p></div>
      ) : (
        <div className="histlist">
          {workouts.map((w, i) => (
            <div className="histitem" key={i}>
              <span className="hist-date">{fmt(w.date)}</span>
              <div className="hist-groups">{w.groups.map(g => <span key={g} className="chip">{GROUP_META[g]?.label || g}</span>)}</div>
              <span className="hist-count">{w.count} упр</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function within(d, days) { return (new Date() - new Date(d)) / 86400000 <= days }
function fmt(s) { return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }
