import { useState } from 'react'
import Icon from './Icon.jsx'
import SparkChart from './SparkChart.jsx'
import MiniRing from './MiniRing.jsx'
import { EXERCISES, GROUPS, GROUP_META } from '../engine/exercises.js'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store, calcStreak, calcWeekStreak } from '../storage.js'
import { shareText } from '../tg.js'
import { allRecords, exSeries, weeklyVolume, volumeByGroup, bodyBalance } from '../engine/progress.js'
import { coverageMap } from '../engine/recovery.js'
import { achievements } from '../engine/achievements.js'

export default function Progress({ profile }) {
  const pr = store.getProgress()
  const workouts = [...pr.workouts].reverse()
  const streak = calcStreak(pr.workouts.map(w => w.date))
  const total = pr.workouts.length
  const week = pr.workouts.filter(w => within(w.date, 7)).length
  const weekStreak = calcWeekStreak(pr.workouts.map(w => w.date))
  const tonTotal = store.getLogs().reduce((a, l) => a + l.sets.reduce((s, x) => s + (x.w || 0) * (x.r || 0), 0), 0)

  const records = allRecords()
  const loggedIds = store.loggedExIds()
  const wv = weeklyVolume()
  const cov = coverageMap(30)
  const covActive = cov.filter(c => c.count > 0)
  const covTop = cov.reduce((a, c) => (c.count > a.count ? c : a), cov[0])
  const covLag = cov.reduce((a, c) => (c.count < a.count ? c : a), cov[0])
  const d30 = new Date(); d30.setDate(d30.getDate() - 30)
  const sessions30 = pr.workouts.filter(w => new Date(w.date) >= d30).length
  const medals = achievements()
  const earned = medals.filter(m => m.earned).length
  const volG = volumeByGroup(30)
  const volMax = Math.max(1, ...GROUPS.map(g => volG[g] || 0))
  const balance = bodyBalance(30)
  const weightSeries = store.getMeasures().filter(m => m.weight != null).map(m => m.weight)
  const kcalWeek = store.foodWeekFull(7)
  const vt = (x) => x >= 1000 ? (x / 1000).toFixed(1) + 'т' : Math.round(x)

  const recId = store.getActiveProgram() || recommendProgram(profile)
  const program = PROGRAMS.find(p => p.id === recId)
  const allowed = profile.equip === 'gym' ? ['none', 'dumbbell', 'gym'] : profile.equip === 'dumbbell' ? ['none', 'dumbbell'] : ['none']

  const [selEx, setSelEx] = useState(loggedIds[0] || null)
  const [stars, setStars] = useState(() => store.getRating()[recId] || 0)
  const [favGroup, setFavGroup] = useState(null)
  const [fav, setFav] = useState(() => store.getFavEx())
  const [more, setMore] = useState(false)
  const series = selEx ? exSeries(selEx) : []

  return (
    <div className="screen">
      {/* Серия и регулярность */}
      <div className="card prog-streak accent-hero">
        <button className="dash-share" onClick={() => shareText('🔥 Мой прогресс в PUMP: серия ' + streak + ' дн., ' + total + ' тренировок, поднято ' + fmtKg(tonTotal) + '. Го со мной 💪')} aria-label="Поделиться"><Icon name="share" size={17} /></button>
        <div className="ps-main">
          <span className="ps-flame"><Icon name="flame" size={26} /></span>
          <div><span className="ps-big">{streak}</span><span className="ps-unit">дней серия</span></div>
          {weekStreak > 0 && <span className="ps-weeks">{weekStreak} нед. подряд</span>}
        </div>
        <div className="ps-row">
          <div><b>{week}</b><span>за 7 дней</span></div>
          <div><b>{total}</b><span>тренировок</span></div>
          <div><b>{fmtKg(tonTotal)}</b><span>тоннаж</span></div>
        </div>
      </div>

      {total === 0 && (
        <div className="empty"><Icon name="activity" size={30} />
          <p>Проведи и отметь первую тренировку — здесь оживут серия, рекорды, объём и медали.</p></div>
      )}

      {/* Сила и объём */}
      {records.length > 0 && (
        <div className="card">
          <span className="card-kicker accent-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="trophy" size={15} /> Личные рекорды</span>
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
        <div className="card">
          <span className="card-kicker accent-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="activity" size={15} /> Рост веса в упражнении</span>
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
        <div className="card">
          <span className="card-kicker accent-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="bolt" size={15} /> Тоннаж по неделям (кг)</span>
          <SparkChart data={wv.map(w => w.vol)} color="#ff5a1f" />
        </div>
      )}

      {/* Ещё — свёрнутая аналитика */}
      <button className="more-toggle" onClick={() => setMore(v => !v)}>
        <Icon name="grid" size={15} /> {more ? 'Скрыть подробную аналитику' : 'Прокачка тела, медали, история'}
        <Icon name={more ? 'chevron' : 'chevronR'} size={16} />
      </button>

      {more && (<>
        {covActive.length > 0 && (
          <div className="card">
            <div className="card-head"><span className="card-kicker"><Icon name="activity" size={15} /> Прокачано за 30 дней</span></div>
            <div className="cov-summary">
              <div><b>{sessions30}</b><span>трен. за 30 дн</span></div>
              <div><b>{GROUP_META[covTop.group].label}</b><span>чаще всего</span></div>
              <div><b>{GROUP_META[covLag.group].label}</b><span>отстаёт</span></div>
            </div>
            <div className="mr-rings">
              {(() => { const mx = Math.max.apply(null, cov.map(x => x.count).concat([1])); return cov.map(c => (
                <MiniRing key={c.group} pct={c.count / mx} color={GROUP_META[c.group].color} center={c.count > 0 ? '×' + c.count : '0'} label={GROUP_META[c.group].label} dim={c.count === 0} />
              )) })()}
            </div>
          </div>
        )}

        {Object.keys(volG).length > 0 && (
          <div className="card">
            <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="bolt" size={15} /> Объём по группам (30 дней)</span>
            <div className="mr-rings">
              {GROUPS.map(g => <MiniRing key={g} pct={(volG[g] || 0) / volMax} color={GROUP_META[g].color} center={vt(volG[g] || 0)} label={GROUP_META[g].label} dim={!volG[g]} />)}
            </div>
          </div>
        )}

        {balance.total > 0 && (
          <div className="card">
            <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="activity" size={15} /> Баланс тела (30 дней)</span>
            <div className="bal-list">
              {[['Толкающие', 'push', '#ff5a1f'], ['Тянущие', 'pull', '#3b82f6'], ['Ноги', 'legs', '#22c55e']].map(([lbl, key, c]) => {
                const pct = Math.round(balance[key] / balance.total * 100)
                return <div className="bal-row" key={key}><span className="bal-l">{lbl}</span><span className="bal-bar"><i style={{ width: pct + '%', background: c }} /></span><span className="bal-v">{pct}%</span></div>
              })}
            </div>
          </div>
        )}

        {weightSeries.length >= 2 && (
          <div className="card">
            <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="activity" size={15} /> Тренд веса тела (кг)</span>
            <SparkChart data={weightSeries} unit=" кг" color="#a855f7" />
          </div>
        )}
        {kcalWeek.some(d => d.kcal > 0) && (
          <div className="card">
            <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="flame" size={15} /> Калории за 7 дней</span>
            <SparkChart data={kcalWeek.map(d => d.kcal)} color="#ff5a1f" />
          </div>
        )}

        <div className="card">
          <div className="card-head"><span className="card-kicker"><Icon name="trophy" size={15} /> Медали</span><span className="card-meta">{earned} из {medals.length}</span></div>
          <div className="medals">
            {medals.map(m => (
              <div className={'medal' + (m.earned ? ' on' : '')} key={m.id}>
                <div className="medal-top">
                  <span className="medal-ic"><Icon name={m.icon} size={20} /></span>
                  {m.earned ? <span className="medal-badge"><Icon name="check" size={13} /> есть</span> : <span className="medal-pct">{Math.round(m.progress * 100)}%</span>}
                </div>
                <span className="medal-cat">{m.cat}</span>
                <span className="medal-t">{m.title}</span>
                <span className="medal-d">{m.desc}</span>
                <span className="medal-bar"><i style={{ width: (m.progress * 100) + '%' }} /></span>
              </div>
            ))}
          </div>
        </div>

        {workouts.length > 0 && (
          <div className="card">
            <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="clock" size={15} /> История тренировок</span>
            <div className="histlist">
              {workouts.slice(0, 20).map((w, i) => (
                <div className="histitem" key={i}>
                  <span className="hist-date">{fmt(w.date)}</span>
                  <div className="hist-groups">{w.groups.map(g => <span key={g} className="chip">{GROUP_META[g]?.label || g}</span>)}</div>
                  <span className="hist-count">{w.count} упр</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card ratecard">
          <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="star" size={15} /> Оценка программы · {program.name}</span>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} className={'star' + (s <= stars ? ' on' : '')} onClick={() => { setStars(s); store.setRating(recId, s) }}><Icon name="star" size={26} /></button>
            ))}
          </div>
        </div>
      </>)}
    </div>
  )
}

function within(d, days) { return (new Date() - new Date(d)) / 86400000 <= days }
function fmt(s) { return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }
function fmtKg(kg) { return kg >= 1000 ? (kg / 1000).toFixed(1) + 'т' : Math.round(kg) + 'кг' }
