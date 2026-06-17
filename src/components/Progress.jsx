import { useState } from 'react'
import Icon from './Icon.jsx'
import SparkChart from './SparkChart.jsx'
import MiniRing from './MiniRing.jsx'
import { EXERCISES, GROUPS, GROUP_META } from '../engine/exercises.js'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store, calcStreak, calcWeekStreak } from '../storage.js'
import { shareText } from '../tg.js'
import { allRecords, exSeries, weeklyVolume } from '../engine/progress.js'
import { coverageMap } from '../engine/recovery.js'
import { achievements } from '../engine/achievements.js'

const TABS = [
  { k: 'overview', label: 'Обзор' },
  { k: 'charts', label: 'Графики' },
  { k: 'medals', label: 'Медали' },
  { k: 'history', label: 'История' }
]

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
  const covLoads = Object.fromEntries(cov.map(c => [c.group, c.load]))
  const covActive = cov.filter(c => c.count > 0)
  const covTop = cov.reduce((a, c) => (c.count > a.count ? c : a), cov[0])
  const covLag = cov.reduce((a, c) => (c.count < a.count ? c : a), cov[0])
  const d30 = new Date(); d30.setDate(d30.getDate() - 30)
  const sessions30 = store.getProgress().workouts.filter(w => new Date(w.date) >= d30).length
  const medals = achievements()
  const earned = medals.filter(m => m.earned).length

  const recId = store.getActiveProgram() || recommendProgram(profile)
  const program = PROGRAMS.find(p => p.id === recId)
  const allowed = profile.equip === 'gym' ? ['none', 'dumbbell', 'gym'] : profile.equip === 'dumbbell' ? ['none', 'dumbbell'] : ['none']

  const [tab, setTab] = useState('overview')
  const [selEx, setSelEx] = useState(loggedIds[0] || null)
  const [stars, setStars] = useState(() => store.getRating()[recId] || 0)
  const [favGroup, setFavGroup] = useState(null)
  const [fav, setFav] = useState(() => store.getFavEx())
  const series = selEx ? exSeries(selEx) : []

  return (
    <div className="screen">
      {/* Герой */}
      <div className="card dash-hero">
        <div className="dash-glow" />
        <button className="dash-share" onClick={() => shareText('🔥 Мой прогресс в PUMP: серия ' + streak + ' дн., ' + total + ' тренировок, поднято ' + fmtKg(tonTotal) + '. Го со мной 💪')} aria-label="Поделиться"><Icon name="share" size={17} /></button>
        <div className="dash-main">
          <span className="dash-flame"><Icon name="flame" size={22} /></span>
          <div><span className="dash-big">{streak}</span><span className="dash-unit">дней серия</span></div>
          {weekStreak > 0 && <span className="dash-weeks"><Icon name="flame" size={13} /> {weekStreak} нед. подряд</span>}
        </div>
        <div className="dash-row">
          <div className="dash-m"><b>{week}</b><span>за 7 дней</span></div>
          <div className="dash-m"><b>{total}</b><span>тренировок</span></div>
          <div className="dash-m"><b>{fmtKg(tonTotal)}</b><span>тоннаж</span></div>
        </div>
      </div>

      <div className="nut-tabs">
        {TABS.map(t => <button key={t.k} className={'nut-tab' + (tab === t.k ? ' on' : '')} onClick={() => setTab(t.k)}>{t.label}</button>)}
      </div>

      {/* ОБЗОР */}
      {tab === 'overview' && (
        <>
          <div className="card">
            <div className="card-head">
              <span className="card-kicker"><Icon name="activity" size={15} /> Прокачано за 30 дней</span>
              {covActive.length > 0 && <span className="card-meta">{covActive.length} групп</span>}
            </div>
            {covActive.length === 0 ? (
              <p className="recovery-hint">Тут покажу, какие мышцы ты грузил за месяц — длиннее полоса значит чаще. Лови баланс.</p>
            ) : (
              <>
              <div className="cov-summary">
                <div><b>{sessions30}</b><span>трен. за 30 дн</span></div>
                <div><b>{GROUP_META[covTop.group].label}</b><span>чаще всего</span></div>
                <div><b>{GROUP_META[covLag.group].label}</b><span>отстаёт</span></div>
              </div>
              <div className="mr-rings">
                {(() => { const mx = Math.max.apply(null, cov.map(x => x.count).concat([1])); return cov.map(c => {
                  const color = GROUP_META[c.group].color
                  return <MiniRing key={c.group} pct={c.count / mx} color={color} center={c.count > 0 ? '×' + c.count : '0'} label={GROUP_META[c.group].label} dim={c.count === 0} />
                }) })()}
              </div>
              </>
            )}
          </div>

          {records.length > 0 && (
            <div className="card">
              <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="trophy" size={15} /> Личные рекорды</span>
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

          <div className="card ratecard">
            <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="star" size={15} /> Оценка программы · {program.name}</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} className={'star' + (s <= stars ? ' on' : '')} onClick={() => { setStars(s); store.setRating(recId, s) }}><Icon name="star" size={26} /></button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ГРАФИКИ */}
      {tab === 'charts' && (
        loggedIds.length === 0 ? (
          <div className="empty"><Icon name="activity" size={30} />
            <p>Пройди тренировку в режиме «Гид по шагам» и записывай веса — здесь оживут графики роста.</p></div>
        ) : (
          <>
            <div className="card">
              <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="activity" size={15} /> Рост веса в упражнении</span>
              <div className="ex-select">
                {loggedIds.slice(0, 8).map(id => {
                  const nm = EXERCISES.find(e => e.id === id)?.name || id
                  return <button key={id} className={'fpill' + (selEx === id ? ' on' : '')} onClick={() => setSelEx(id)}>{nm}</button>
                })}
              </div>
              <SparkChart data={series.map(s => s.best)} unit=" кг" />
            </div>
            <div className="card">
              <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="clock" size={15} /> История подходов</span>
              <div className="exhist">
                {store.getExLogs(selEx).slice().reverse().slice(0, 20).map((l, i) => (
                  <div className="exhist-row" key={i}>
                    <span className="exhist-date">{fmt(l.date)}</span>
                    <span className="exhist-sets">{l.sets.map(x => (x.w ? x.w : '—') + '×' + x.r).join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
            {wv.length > 0 && (
              <div className="card">
                <span className="card-kicker" style={{ marginBottom: 12, display: 'inline-flex' }}><Icon name="bolt" size={15} /> Тоннаж по неделям (кг)</span>
                <SparkChart data={wv.map(w => w.vol)} color="#3b82f6" />
              </div>
            )}
          </>
        )
      )}

      {/* МЕДАЛИ */}
      {tab === 'medals' && (
        <div className="card">
          <div className="card-head">
            <span className="card-kicker"><Icon name="trophy" size={15} /> Медали</span>
            <span className="card-meta">{earned} из {medals.length}</span>
          </div>
          <div className="medals">
            {medals.map(m => (
              <div className={'medal' + (m.earned ? ' on' : '')} key={m.id}>
                <div className="medal-top">
                  <span className="medal-ic"><Icon name={m.icon} size={20} /></span>
                  {m.earned
                    ? <span className="medal-badge"><Icon name="check" size={13} /> есть</span>
                    : <span className="medal-pct">{Math.round(m.progress * 100)}%</span>}
                </div>
                <span className="medal-cat">{m.cat}</span>
                <span className="medal-t">{m.title}</span>
                <span className="medal-d">{m.desc}</span>
                <span className="medal-bar"><i style={{ width: (m.progress * 100) + '%' }} /></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ИСТОРИЯ */}
      {tab === 'history' && (
        <>
          <div className="block-head"><h2 className="display sm">История тренировок</h2></div>
          {workouts.length === 0 ? (
            <div className="empty"><Icon name="activity" size={28} /><p>Отметь тренировку выполненной — появится здесь.</p></div>
          ) : (
            <div className="histlist">
              {workouts.slice(0, 30).map((w, i) => (
                <div className="histitem" key={i}>
                  <span className="hist-date">{fmt(w.date)}</span>
                  <div className="hist-groups">{w.groups.map(g => <span key={g} className="chip">{GROUP_META[g]?.label || g}</span>)}</div>
                  <span className="hist-count">{w.count} упр</span>
                </div>
              ))}
            </div>
          )}

          <div className="block-head" style={{ marginTop: 22 }}><h2 className="display sm">Любимые упражнения</h2></div>
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
        </>
      )}
    </div>
  )
}

function within(d, days) { return (new Date() - new Date(d)) / 86400000 <= days }
function fmt(s) { return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }
function fmtKg(kg) { return kg >= 1000 ? (kg / 1000).toFixed(1) + 'т' : Math.round(kg) + 'кг' }
