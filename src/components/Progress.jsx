import { useState } from 'react'
import Icon from './Icon.jsx'
import SparkChart from './SparkChart.jsx'
import { EXERCISES, GROUPS, GROUP_META } from '../engine/exercises.js'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store, calcStreak } from '../storage.js'
import { allRecords, exSeries, weeklyVolume } from '../engine/progress.js'

export default function Progress({ profile }) {
  const pr = store.getProgress()
  const workouts = [...pr.workouts].reverse()
  const streak = calcStreak(pr.workouts.map(w => w.date))
  const total = pr.workouts.length
  const week = pr.workouts.filter(w => within(w.date, 7)).length

  const records = allRecords()
  const loggedIds = store.loggedExIds()
  const [selEx, setSelEx] = useState(loggedIds[0] || null)
  const series = selEx ? exSeries(selEx) : []
  const wv = weeklyVolume()

  const recId = recommendProgram(profile)
  const program = PROGRAMS.find(p => p.id === recId)
  const [stars, setStars] = useState(() => store.getRating()[recId] || 0)
  const [favGroup, setFavGroup] = useState(null)
  const [fav, setFav] = useState(() => store.getFavEx())
  const allowed = profile.equip === 'gym' ? ['none', 'dumbbell', 'gym'] : profile.equip === 'dumbbell' ? ['none', 'dumbbell'] : ['none']

  return (
    <div className="screen">
      <div className="stats3">
        <div className="stat3"><Icon name="trophy" size={18} /><b>{streak}</b><span>серия</span></div>
        <div className="stat3"><Icon name="activity" size={18} /><b>{week}</b><span>за 7 дней</span></div>
        <div className="stat3"><Icon name="dumbbell" size={18} /><b>{total}</b><span>всего</span></div>
      </div>

      {records.length > 0 && (
        <div className="card-box">
          <span className="flabel">Личные рекорды</span>
          <div className="prlist">
            {records.slice(0, 6).map(r => (
              <div className="prrow" key={r.exId}>
                <span className="pr-name">{r.name}</span>
                <span className="pr-val">{r.pr.best > 0 ? r.pr.best + ' кг' : '—'}<small> · 1ПМ {r.pr.e1rm}</small></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loggedIds.length > 0 && (
        <div className="card-box">
          <span className="flabel">Рост веса в упражнении</span>
          <div className="ex-select">
            {loggedIds.slice(0, 8).map(id => {
              const nm = EXERCISES.find(e => e.id === id)?.name || id
              return <button key={id} className={'fpill' + (selEx === id ? ' on' : '')} onClick={() => setSelEx(id)}>{nm}</button>
            })}
          </div>
          <SparkChart data={series.map(s => s.best)} unit=" кг" />
        </div>
      )}

      {wv.length > 0 && (
        <div className="card-box">
          <span className="flabel">Тоннаж по неделям (кг)</span>
          <SparkChart data={wv.map(w => w.vol)} color="#3b82f6" />
        </div>
      )}

      {loggedIds.length === 0 && (
        <div className="empty"><Icon name="activity" size={30} />
          <p>Пройди тренировку в режиме «Гид по шагам» и записывай веса — здесь появятся графики роста и рекорды.</p></div>
      )}

      <div className="ratecard">
        <span className="flabel">Оценка программы · {program.name}</span>
        <div className="stars">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} className={'star' + (s <= stars ? ' on' : '')} onClick={() => { setStars(s); store.setRating(recId, s) }}><Icon name="star" size={26} /></button>
          ))}
        </div>
      </div>

      <div className="block-head"><h2 className="display sm">Любимые упражнения</h2></div>
      <div className="favchips">
        {GROUPS.map(g => <button key={g} className={'favchip' + (favGroup === g ? ' on' : '')} onClick={() => setFavGroup(favGroup === g ? null : g)}>{GROUP_META[g].label}</button>)}
      </div>
      {favGroup && (
        <div className="exlist" style={{ marginTop: 10 }}>
          {EXERCISES.filter(e => e.group === favGroup && allowed.includes(e.equip)).map(e => (
            <button className="exrow" key={e.id} onClick={() => setFav(store.toggleFavEx(e.id))}>
              <div className="exrow-main"><span className="exrow-name">{e.name}</span><span className="exrow-sub">{e.compound ? 'база' : 'изоляция'}</span></div>
              <span className={'favstar' + (fav.includes(e.id) ? ' on' : '')}><Icon name="star" size={20} /></span>
            </button>
          ))}
        </div>
      )}

      <div className="block-head" style={{ marginTop: 20 }}><h2 className="display sm">История</h2></div>
      {workouts.length === 0 ? (
        <div className="empty"><Icon name="activity" size={28} /><p>Отметь тренировку выполненной — появится здесь.</p></div>
      ) : (
        <div className="histlist">
          {workouts.slice(0, 20).map((w, i) => (
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
