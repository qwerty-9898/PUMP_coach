import { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import SparkChart from './SparkChart.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { FOODS, searchFoods, macrosFor } from '../data/foods.js'
import { dayScore } from '../engine/foodscore.js'
import { searchOFF, productByBarcode } from '../engine/offapi.js'
import { store, todayKey } from '../storage.js'
import BarcodeScanner from './BarcodeScanner.jsx'

const MEALS = [
  { key: 'Завтрак', ratio: 0.30 },
  { key: 'Обед', ratio: 0.35 },
  { key: 'Ужин', ratio: 0.25 },
  { key: 'Перекус', ratio: 0.10 }
]
const byId = Object.fromEntries(FOODS.map(f => [f.id, f]))
const FAST_WINDOWS = [16, 18, 14]
function yesterdayKey() { const d = new Date(); d.setDate(d.getDate() - 1); return todayKey(d) }

export default function Nutrition({ profile }) {
  const auto = calcNutrition(profile)
  const date = todayKey()
  const [tick, setTick] = useState(0)
  const [addMeal, setAddMeal] = useState(null)
  const [editUid, setEditUid] = useState(null)
  const [editGoal, setEditGoal] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [flash, setFlash] = useState('')
  const refresh = () => setTick(t => t + 1)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(id) }, [])
  function toast(msg) { setFlash(msg); setTimeout(() => setFlash(''), 2200) }

  const override = store.getKcalGoal()
  const goalKcal = override || auto.kcal
  const protein = auto.protein, fat = auto.fat
  const carbs = Math.max(0, Math.round((goalKcal - protein * 4 - fat * 9) / 4))

  const entries = store.getFoodDay(date)
  const eaten = entries.reduce((a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }), { kcal: 0, p: 0, f: 0, c: 0 })

  const todWorkouts = store.getProgress().workouts.filter(w => w.date === date).length
  const burned = Math.round(todWorkouts * profile.weight * 4.5)
  const remaining = goalKcal - eaten.kcal + burned
  const week = store.foodWeekFull(7)
  const score = dayScore(eaten, { kcal: goalKcal, protein })

  function addEntry(food, grams, meal) {
    const base = macrosFor(food, grams)
    const ex = store.getFoodDay(date).find(e => e.foodId === food.id && e.meal === meal && e.grams === grams)
    if (ex) { const qty = (ex.qty || 1) + 1; store.updateFood(date, ex.uid, { qty, base, kcal: base.kcal * qty, p: base.p * qty, f: base.f * qty, c: base.c * qty }) }
    else { store.addFood(date, { foodId: food.id, name: food.name, grams, meal, qty: 1, base, ...base }) }
    setAddMeal(null); refresh()
  }
  function addDishEntry(dish, meal) {
    const base = { kcal: dish.kcal, p: dish.p, f: dish.f, c: dish.c }
    const ex = store.getFoodDay(date).find(e => e.name === dish.name && e.meal === meal && !e.foodId)
    if (ex) { const qty = (ex.qty || 1) + 1; store.updateFood(date, ex.uid, { qty, base, kcal: base.kcal * qty, p: base.p * qty, f: base.f * qty, c: base.c * qty }) }
    else { store.addFood(date, { foodId: null, name: dish.name, grams: dish.portion, meal, qty: 1, base, ...base }) }
    setAddMeal(null); refresh()
  }
  function addManual(name, kcal, p, meal) { const base = { kcal: Number(kcal) || 0, p: Number(p) || 0, f: 0, c: 0 }; store.addFood(date, { foodId: null, name, grams: 0, meal, qty: 1, base, ...base }); setAddMeal(null); refresh() }
  function changeQty(e, delta) {
    const qty = (e.qty || 1) + delta
    if (qty < 1) { store.removeFood(date, e.uid); refresh(); return }
    const u = e.qty || 1
    const base = e.base || { kcal: Math.round(e.kcal / u), p: Math.round(e.p / u), f: Math.round(e.f / u), c: Math.round(e.c / u) }
    store.updateFood(date, e.uid, { qty, base, kcal: base.kcal * qty, p: base.p * qty, f: base.f * qty, c: base.c * qty })
    refresh()
  }
  function remove(uid) { store.removeFood(date, uid); refresh() }
  function repeatDay(meal) {
    const n = store.copyFood(yesterdayKey(), date, meal || null)
    if (n) { toast(meal ? 'Перенёс «' + meal + '» из вчера' : 'Перенёс вчерашний день: ' + n + ' поз.'); refresh() }
    else toast(meal ? 'Вчера в «' + meal + '» пусто' : 'Вчера записей нет')
  }

  function addPhotoItems(items, meal) {
    items.forEach(it => {
      const base = { kcal: it.kcal, p: it.p, f: it.f, c: it.c }
      store.addFood(date, { foodId: null, name: it.name, grams: it.grams || 0, meal, qty: 1, base, ...base })
    })
    setPhotoOpen(false); toast('Добавлено по фото: ' + items.length + ' поз.'); refresh()
  }

  if (addMeal) return <AddPanel meal={addMeal} onAdd={addEntry} onAddDish={addDishEntry} onManual={addManual} onClose={() => setAddMeal(null)} onChange={refresh} />

  const editEntry = editUid ? entries.find(e => e.uid === editUid) : null

  return (
    <div className="screen">
      {/* Кольцо + баланс + score */}
      <div className="card nuthero">
        <NutritionRing eaten={eaten.kcal} goal={goalKcal} p={[eaten.p, protein]} c={[eaten.c, carbs]} f={[eaten.f, fat]} />
        <div className="nh-side">
          <div className="nh-rem"><span>Осталось</span><b>{Math.max(0, remaining)}</b></div>
          <div className="nh-bal">
            <div><span>Цель</span><b>{goalKcal}</b></div>
            <div><span>Съедено</span><b>{eaten.kcal}</b></div>
            <div><span>Сожжено</span><b className="accent">+{burned}</b></div>
          </div>
          <div className="nh-actions">
            {score
              ? <button className="scorechip" onClick={() => setScoreOpen(true)} style={{ '--sc': score.color }}><b>{score.grade}</b><span>качество</span></button>
              : <span className="scorechip empty"><b>—</b><span>качество</span></span>}
            <button className="goal-edit" onClick={() => setEditGoal(v => !v)}><Icon name="edit" size={13} /> Цель</button>
          </div>
        </div>
      </div>

      {editGoal && (
        <div className="goalbox">
          <span className="flabel">Цель калорий в день</span>
          <div className="goal-row">
            <input type="number" inputMode="numeric" defaultValue={goalKcal} id="goalInput" />
            <button className="cta sm" onClick={() => { const v = Number(document.getElementById('goalInput').value); store.setKcalGoal(v > 0 ? v : null); setEditGoal(false); refresh() }}>ОК</button>
          </div>
          <button className="textlink" onClick={() => { store.setKcalGoal(null); setEditGoal(false); refresh() }}>
            <Icon name="refresh" size={13} /> Авто ({auto.kcal} ккал под цель «{profile.goal}»)
          </button>
        </div>
      )}

      {/* Белок — главный приоритет */}
      <div className="protein-card">
        <div className="pc-head">
          <span className="pc-lbl"><Icon name="bolt" size={14} /> Белок</span>
          <span className="pc-val"><b>{eaten.p}</b> / {protein} г</span>
        </div>
        <div className="pc-bar"><i style={{ width: Math.min(100, protein ? (eaten.p / protein) * 100 : 0) + '%' }} /></div>
        <span className="pc-sub">цель {(protein / profile.weight).toFixed(1)} г/кг · осталось {Math.max(0, protein - eaten.p)} г</span>
      </div>

      <div className="macrolegend">
        <Leg label="Углеводы" v={eaten.c} g={carbs} color="#f59e0b" />
        <Leg label="Жиры" v={eaten.f} g={fat} color="#ec4899" />
      </div>

      {/* Быстрые действия */}
      <div className="nut-quick">
        <button onClick={() => repeatDay(null)}><Icon name="refresh" size={16} /> Вчера</button>
        <button onClick={() => setScanOpen(true)}><Icon name="barcode" size={16} /> Штрихкод</button>
        <button onClick={() => setPhotoOpen(true)}><Icon name="apple" size={16} /> Фото</button>
      </div>

      {/* Приёмы пищи */}
      {MEALS.map(meal => {
        const list = entries.filter(e => e.meal === meal.key)
        const sum = list.reduce((a, e) => a + e.kcal, 0)
        const target = Math.round(goalKcal * meal.ratio)
        const mp = Math.min(100, Math.round((sum / target) * 100))
        return (
          <div className="mealblock" key={meal.key}>
            <div className="mealblock-head">
              <div className="mb-title">
                <span className="mealblock-name">{meal.key}</span>
                <span className="mb-target">{sum} / {target} ккал</span>
              </div>
              <div className="mb-acts">
                <button className="mb-rep" onClick={() => repeatDay(meal.key)} aria-label="Повторить вчерашний приём"><Icon name="refresh" size={15} /></button>
                <button className="addbtn" onClick={() => setAddMeal(meal.key)} aria-label="Добавить"><Icon name="plus" size={18} /></button>
              </div>
            </div>
            <div className="mb-bar"><i style={{ width: mp + '%' }} /></div>
            {list.length > 0 && (
              <div className="mealblock-items">
                {list.map(e => (
                  <div className="foodrow" key={e.uid}>
                    <button className="foodrow-main" onClick={() => setEditUid(e.uid)}>
                      <span className="foodrow-name">{e.name}{(e.qty || 1) > 1 ? ' ×' + e.qty : ''}</span>
                      <span className="foodrow-sub">{e.grams ? e.grams + (e.qty > 1 ? '×' + e.qty : '') + ' г · ' : ''}Б {e.p} · Ж {e.f} · У {e.c}</span>
                    </button>
                    <div className="qtybox">
                      <button onClick={() => changeQty(e, -1)} aria-label="Меньше"><Icon name="minus" size={14} /></button>
                      <span>{e.qty || 1}</span>
                      <button onClick={() => changeQty(e, 1)} aria-label="Больше"><Icon name="plus" size={14} /></button>
                    </div>
                    <span className="foodrow-kcal">{e.kcal}</span>
                    <button className="delbtn" onClick={() => remove(e.uid)} aria-label="Удалить"><Icon name="trash" size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="nut-2col">
        <WaterMini profile={profile} date={date} onChange={refresh} />
        <FastingCard onChange={refresh} />
      </div>

      <WeekCard week={week} goalKcal={goalKcal} protein={protein} />

      {flash && <div className="nut-toast">{flash}</div>}

      {editEntry && <PortionEdit entry={editEntry} onSave={(grams) => {
        const food = byId[editEntry.foodId]
        if (food) store.updateFood(date, editEntry.uid, { grams, ...macrosFor(food, grams) })
        setEditUid(null); refresh()
      }} onClose={() => setEditUid(null)} />}

      {scanOpen && <BarcodeSheet onClose={() => setScanOpen(false)} onAdd={(food, grams, meal) => { addEntry(food, grams, meal); setScanOpen(false); toast('Добавлено: ' + food.name) }} />}
      {scoreOpen && score && <ScoreSheet score={score} onClose={() => setScoreOpen(false)} />}
      {photoOpen && <PhotoSheet onClose={() => setPhotoOpen(false)} onAddItems={addPhotoItems} />}
    </div>
  )
}

// Кольцо калорий + дуги БЖУ
function NutritionRing({ eaten, goal, p, c, f }) {
  const R = [72, 56, 42, 30]
  const W = [13, 7, 7, 7]
  const arc = (r, pct, color, w) => {
    const circ = 2 * Math.PI * r
    const off = circ * (1 - Math.min(1, pct))
    return (
      <g key={r}>
        <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={w} />
        <circle cx="84" cy="84" r={r} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off} />
      </g>
    )
  }
  return (
    <div className="nutring">
      <svg viewBox="0 0 168 168" className="nutring-svg">
        <g transform="rotate(-90 84 84)">
          {arc(R[0], goal ? eaten / goal : 0, 'url(#ng)', W[0])}
          {arc(R[1], p[1] ? p[0] / p[1] : 0, '#3b82f6', W[1])}
          {arc(R[2], c[1] ? c[0] / c[1] : 0, '#f59e0b', W[2])}
          {arc(R[3], f[1] ? f[0] / f[1] : 0, '#ec4899', W[3])}
        </g>
        <defs><linearGradient id="ng" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8a3d" /><stop offset="1" stopColor="#ff5a1f" /></linearGradient></defs>
      </svg>
      <div className="nutring-c">
        <span className="nutring-num">{eaten}</span>
        <span className="nutring-lbl">ккал</span>
        <span className="nutring-goal">из {goal}</span>
      </div>
    </div>
  )
}

function Leg({ label, v, g, color }) {
  return (
    <div className="leg">
      <span className="leg-dot" style={{ background: color }} />
      <span className="leg-l">{label}</span>
      <span className="leg-v">{v} / {g} г</span>
    </div>
  )
}

function WeekCard({ week, goalKcal, protein }) {
  const withFood = week.filter(d => d.kcal > 0)
  if (!withFood.length) {
    return (
      <div className="card weekcard">
        <span className="card-kicker"><Icon name="activity" size={15} /> Эта неделя</span>
        <p className="sub" style={{ margin: '8px 0 0' }}>Веди дневник — здесь появятся тренды калорий, белка и дней в цели.</p>
      </div>
    )
  }
  const avgKcal = Math.round(withFood.reduce((a, d) => a + d.kcal, 0) / withFood.length)
  const avgProt = Math.round(withFood.reduce((a, d) => a + d.p, 0) / withFood.length)
  const onTarget = withFood.filter(d => Math.abs(d.kcal - goalKcal) <= goalKcal * 0.12).length
  return (
    <div className="card weekcard">
      <span className="card-kicker" style={{ marginBottom: 10, display: 'inline-flex' }}><Icon name="activity" size={15} /> Эта неделя</span>
      <SparkChart data={week.map(d => d.kcal)} unit="" />
      <div className="week-stats">
        <div><span>Средн. ккал</span><b>{avgKcal}</b></div>
        <div><span>Средн. белок</span><b>{avgProt} г</b></div>
        <div><span>Дней в цели</span><b className="accent">{onTarget}/{withFood.length}</b></div>
      </div>
    </div>
  )
}

function ScoreSheet({ score, onClose }) {
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        <div className="score-big" style={{ '--sc': score.color }}>
          <span className="score-grade">{score.grade}</span>
          <span className="score-num">{score.score}<small>/100</small></span>
        </div>
        <span className="addhead-t" style={{ textAlign: 'center', display: 'block', marginTop: 6 }}>Качество питания сегодня</span>
        <div className="score-tips">
          {score.tips.map((t, i) => <div className="score-tip" key={i}><Icon name="info" size={14} /> {t}</div>)}
        </div>
        <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>Оценка по добору белка, попаданию в калории и доле жиров.</p>
        <button className="cta" onClick={onClose}>Понятно</button>
      </div>
    </div>
  )
}

function BarcodeSheet({ onClose, onAdd }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [prod, setProd] = useState(null)
  const [err, setErr] = useState('')
  const [grams, setGrams] = useState(100)
  const [meal, setMeal] = useState('Перекус')
  const [scanning, setScanning] = useState(false)
  async function lookup(c) {
    const q = c || code
    if (!q) return
    setLoading(true); setErr(''); setProd(null)
    const p = await productByBarcode(q)
    setLoading(false)
    if (p) { setProd(p); setGrams(100) } else setErr('Не нашли продукт. Проверь номер или добавь вручную через приём пищи.')
  }
  function onScan(text) {
    setScanning(false)
    const c = String(text || '').replace(/\D/g, '')
    if (c) { setCode(c); lookup(c) } else setErr('Не распознал код. Попробуй ещё раз или введи вручную.')
  }
  const m = prod ? macrosFor(prod, grams) : null
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        <span className="addhead-t"><Icon name="barcode" size={18} /> Поиск по штрихкоду</span>
        {scanning && <BarcodeScanner onDetected={onScan} onClose={() => setScanning(false)} />}
        <button className="cta ghost-cta" style={{ marginTop: 12 }} onClick={() => setScanning(true)}><Icon name="scan" size={18} /> Сканировать камерой</button>
        <div className="goal-row" style={{ marginTop: 10 }}>
          <input type="number" inputMode="numeric" placeholder="Штрихкод с упаковки" value={code} onChange={e => setCode(e.target.value)} />
          <button className="cta sm" onClick={() => lookup()} disabled={loading}>{loading ? '...' : 'Найти'}</button>
        </div>
        {err && <p className="sub" style={{ color: '#f97316', marginTop: 8 }}>{err}</p>}
        {prod && m && (
          <div className="bc-prod">
            <span className="bc-name">{prod.name}</span>
            <div className="portion-quick" style={{ marginTop: 8 }}>
              {[50, 100, 150, 200, 300].map(g => <button key={g} className={'qchip' + (grams === g ? ' on' : '')} onClick={() => setGrams(g)}>{g} г</button>)}
            </div>
            <div className="portion-macros" style={{ marginTop: 10 }}>
              <div><span>Ккал</span><b className="accent">{m.kcal}</b></div>
              <div><span>Белки</span><b>{m.p} г</b></div>
              <div><span>Углев</span><b>{m.c} г</b></div>
              <div><span>Жиры</span><b>{m.f} г</b></div>
            </div>
            <div className="bc-meals">
              {MEALS.map(mm => <button key={mm.key} className={'qchip' + (meal === mm.key ? ' on' : '')} onClick={() => setMeal(mm.key)}>{mm.key}</button>)}
            </div>
            <button className="cta" onClick={() => onAdd(prod, grams, meal)}><Icon name="plus" size={18} /> Добавить в «{meal}»</button>
          </div>
        )}
      </div>
    </div>
  )
}

function resizeImage(file, max) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h
      cv.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(cv.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

function PhotoSheet({ onClose, onAddItems }) {
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [items, setItems] = useState(null)
  const [meal, setMeal] = useState('Обед')
  async function onFile(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return
    setErr(''); setItems(null); setLoading(true)
    try {
      const dataUrl = await resizeImage(file, 512)
      const r = await fetch('/api/photo-calories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(j.message || 'Сервис недоступен. Возможно, не настроен ИИ-ключ на Vercel.'); setLoading(false); return }
      if (!j.items || !j.items.length) { setErr('Не нашёл еду на фото. Сними ближе и при свете.'); setLoading(false); return }
      setItems(j.items)
    } catch (e) { setErr('Не получилось распознать. Проверь интернет или добавь вручную.') }
    setLoading(false)
  }
  const total = (items || []).reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, f: a.f + it.f, c: a.c + it.c }), { kcal: 0, p: 0, f: 0, c: 0 })
  function removeItem(i) { setItems(arr => arr.filter((_, j) => j !== i)) }
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        <span className="addhead-t"><Icon name="apple" size={18} /> Калории по фото</span>
        {!items && (
          <>
            <p className="sub" style={{ marginTop: 6 }}>Сфоткай тарелку — ИИ оценит блюда и КБЖУ. Лучше сверху и при хорошем свете.</p>
            <label className={'cta' + (loading ? ' disabled' : '')} style={{ marginTop: 12 }}>
              <Icon name="apple" size={18} /> {loading ? 'Распознаю…' : 'Сделать фото / выбрать'}
              <input type="file" accept="image/*" capture="environment" hidden onChange={onFile} disabled={loading} />
            </label>
          </>
        )}
        {err && <p className="sub" style={{ color: '#f97316', marginTop: 8 }}>{err}</p>}
        {items && items.length > 0 && (
          <>
            <div className="bc-meals" style={{ marginTop: 12 }}>
              {MEALS.map(mm => <button key={mm.key} className={'qchip' + (meal === mm.key ? ' on' : '')} onClick={() => setMeal(mm.key)}>{mm.key}</button>)}
            </div>
            <div className="photo-items">
              {items.map((it, i) => (
                <div className="foodrow" key={i}>
                  <div className="foodrow-main" style={{ cursor: 'default' }}>
                    <span className="foodrow-name">{it.name}</span>
                    <span className="foodrow-sub">{it.grams ? it.grams + ' г · ' : ''}Б {it.p} · Ж {it.f} · У {it.c}</span>
                  </div>
                  <span className="foodrow-kcal">{it.kcal}</span>
                  <button className="delbtn" onClick={() => removeItem(i)}><Icon name="trash" size={16} /></button>
                </div>
              ))}
            </div>
            <div className="dish-total">Итого: <b>{total.kcal} ккал</b> · Б {total.p} · Ж {total.f} · У {total.c}</div>
            <p className="sub" style={{ fontSize: 11.5, margin: '6px 0 10px' }}>Оценка примерная — поправь, удалив лишнее.</p>
            <button className="cta" onClick={() => onAddItems(items, meal)}><Icon name="plus" size={18} /> Добавить в «{meal}»</button>
          </>
        )}
      </div>
    </div>
  )
}

function WaterMini({ profile, date, onChange }) {
  const goal = Math.round(profile.weight * 30)
  const ml = store.getWater()[date] || 0
  const pct = Math.min(100, Math.round((ml / goal) * 100))
  function add(a) { const w = store.getWater(); w[date] = Math.max(0, ml + a); store.setWater(w); onChange() }
  return (
    <div className="card mini">
      <span className="mini-h"><Icon name="droplet" size={15} /> Вода</span>
      <div className="mini-big">{(ml / 1000).toFixed(1)}<small> / {(goal / 1000).toFixed(1)} л</small></div>
      <div className="mb-bar"><i style={{ width: pct + '%', background: '#3b82f6' }} /></div>
      <div className="mini-btns">
        <button onClick={() => add(250)}>+250</button>
        <button onClick={() => add(500)}>+500</button>
        <button className="ghost" onClick={() => add(-250)}>−250</button>
      </div>
    </div>
  )
}

function FastingCard({ onChange }) {
  const fast = store.getFast()
  const [win, setWin] = useState(16)
  if (fast && fast.start) {
    const elapsed = Date.now() - fast.start
    const target = fast.window * 3600000
    const pct = Math.min(100, Math.round((elapsed / target) * 100))
    const h = Math.floor(elapsed / 3600000), m = Math.floor((elapsed % 3600000) / 60000)
    return (
      <div className="card mini">
        <span className="mini-h"><Icon name="clock" size={15} /> Голодание</span>
        <div className="mini-big">{h}<small> ч </small>{m}<small> мин</small></div>
        <div className="mb-bar"><i style={{ width: pct + '%', background: '#a855f7' }} /></div>
        <div className="mini-sub">цель {fast.window}:{24 - fast.window} · {pct}%</div>
        <button className="mini-stop" onClick={() => { store.setFast(null); onChange() }}>Завершить</button>
      </div>
    )
  }
  return (
    <div className="card mini">
      <span className="mini-h"><Icon name="clock" size={15} /> Голодание</span>
      <div className="fast-wins">
        {FAST_WINDOWS.map(w => <button key={w} className={'fast-w' + (win === w ? ' on' : '')} onClick={() => setWin(w)}>{w}:{24 - w}</button>)}
      </div>
      <button className="mini-start" onClick={() => { store.setFast({ start: Date.now(), window: win }); onChange() }}>Начать {win}:{24 - win}</button>
    </div>
  )
}

function PortionEdit({ entry, onSave, onClose }) {
  const [grams, setGrams] = useState(entry.grams || 100)
  const editable = !!entry.foodId
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-card" onClick={e => e.stopPropagation()}>
        <span className="addhead-t">{entry.name}</span>
        {editable ? (
          <>
            <div className="portion-row">
              <button className="iconbtn big" onClick={() => setGrams(g => Math.max(5, g - 10))}><Icon name="minus" size={20} /></button>
              <input type="number" inputMode="numeric" value={grams} onChange={e => setGrams(Math.max(1, Number(e.target.value) || 0))} />
              <button className="iconbtn big" onClick={() => setGrams(g => g + 10)}><Icon name="plus" size={20} /></button>
            </div>
            <div className="portion-quick">
              {[50, 100, 150, 200, 300].map(g => <button key={g} className={'qchip' + (grams === g ? ' on' : '')} onClick={() => setGrams(g)}>{g} г</button>)}
            </div>
            <button className="cta" onClick={() => onSave(grams)}><Icon name="check" size={18} /> Сохранить порцию</button>
          </>
        ) : (
          <p className="sub" style={{ marginTop: 4 }}>Это блюдо или ручная запись — порцию не пересчитать. Удали и добавь заново, если нужно поправить.</p>
        )}
      </div>
    </div>
  )
}

const TABS = [
  { k: 'search', label: 'Поиск' }, { k: 'recent', label: 'Частые' }, { k: 'fav', label: 'Избранное' },
  { k: 'dishes', label: 'Мои блюда' }, { k: 'manual', label: 'Вручную' }
]

function AddPanel({ meal, onAdd, onAddDish, onManual, onClose, onChange }) {
  const [tab, setTab] = useState('search')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [grams, setGrams] = useState(100)
  const [building, setBuilding] = useState(false)
  const [online, setOnline] = useState(null)
  const [onLoading, setOnLoading] = useState(false)
  const [mName, setMName] = useState(''); const [mKcal, setMKcal] = useState(''); const [mProt, setMProt] = useState('')
  const [, force] = useState(0)
  const fav = store.getFavorites()
  function pick(food) { setSel(food); setGrams(food.portion || 100) }
  function toggleFav(e, id) { e.stopPropagation(); store.toggleFavorite(id); force(x => x + 1); onChange && onChange() }
  async function findOnline() { setOnLoading(true); setOnline(null); const r = await searchOFF(q); setOnLoading(false); setOnline(r) }

  if (building) return <DishBuilder onClose={() => setBuilding(false)} onSaved={() => { setBuilding(false); setTab('dishes') }} />

  if (sel) {
    const m = macrosFor(sel, grams)
    return (
      <div className="screen">
        <div className="addhead">
          <button className="iconbtn" onClick={() => setSel(null)}><Icon name="back" size={20} /></button>
          <span className="addhead-t">{sel.name}</span>
        </div>
        <div className="portioncard">
          <span className="flabel">Порция, грамм{sel.off ? ' · из интернета' : ''}</span>
          <div className="portion-row">
            <button className="iconbtn big" onClick={() => setGrams(g => Math.max(5, g - 10))}><Icon name="minus" size={20} /></button>
            <input type="number" inputMode="numeric" value={grams} onChange={e => setGrams(Math.max(1, Number(e.target.value) || 0))} />
            <button className="iconbtn big" onClick={() => setGrams(g => g + 10)}><Icon name="plus" size={20} /></button>
          </div>
          <div className="portion-quick">
            {[50, 100, 150, 200, 300].map(g => <button key={g} className={'qchip' + (grams === g ? ' on' : '')} onClick={() => setGrams(g)}>{g} г</button>)}
          </div>
          <div className="portion-macros">
            <div><span>Ккал</span><b className="accent">{m.kcal}</b></div>
            <div><span>Белки</span><b>{m.p} г</b></div>
            <div><span>Углев</span><b>{m.c} г</b></div>
            <div><span>Жиры</span><b>{m.f} г</b></div>
          </div>
        </div>
        <button className="cta" onClick={() => onAdd(sel, grams, meal)}><Icon name="plus" size={18} /> Добавить в «{meal}»</button>
      </div>
    )
  }

  const recent = store.frequentFoods(16).map(id => byId[id]).filter(Boolean)
  const favList = fav.map(id => byId[id]).filter(Boolean)
  const dishes = store.getDishes()
  const localRes = searchFoods(q).slice(0, 60)

  return (
    <div className="screen">
      <div className="addhead">
        <button className="iconbtn" onClick={onClose}><Icon name="back" size={20} /></button>
        <span className="addhead-t">Добавить в «{meal}»</span>
      </div>
      <div className="nut-tabs">
        {TABS.map(t => <button key={t.k} className={'nut-tab' + (tab === t.k ? ' on' : '')} onClick={() => setTab(t.k)}>{t.label}</button>)}
      </div>
      {tab === 'search' && (
        <>
          <div className="searchbar">
            <Icon name="search" size={18} className="searchbar-ic" />
            <input className="searchinput" placeholder="Найди еду: гречка, банан, шаурма…" value={q} onChange={e => { setQ(e.target.value); setOnline(null) }} />
          </div>
          <FoodList foods={localRes} fav={fav} onPick={pick} onFav={toggleFav} />
          {q.trim().length >= 2 && (
            <>
              {online === null
                ? <button className="cta ghost-cta online-btn" onClick={findOnline} disabled={onLoading}>
                    <Icon name="search" size={16} /> {onLoading ? 'Ищу в интернете…' : 'Искать ещё в интернете'}
                  </button>
                : <>
                    <div className="online-lbl">{online.length ? 'Из интернета (Open Food Facts):' : 'В интернете тоже ничего не нашлось'}</div>
                    <FoodList foods={online} fav={fav} onPick={pick} onFav={toggleFav} />
                  </>}
            </>
          )}
        </>
      )}
      {tab === 'recent' && (recent.length ? <FoodList foods={recent} fav={fav} onPick={pick} onFav={toggleFav} />
        : <div className="empty"><Icon name="flame" size={28} /><p>Тут появятся продукты, которые ты добавляешь чаще всего.</p></div>)}
      {tab === 'fav' && (favList.length ? <FoodList foods={favList} fav={fav} onPick={pick} onFav={toggleFav} />
        : <div className="empty"><Icon name="star" size={28} /><p>Отмечай продукты звёздочкой — появятся здесь для быстрого доступа.</p></div>)}
      {tab === 'dishes' && (
        <>
          <button className="cta auto-btn" onClick={() => setBuilding(true)}><Icon name="plus" size={18} /> Собрать своё блюдо</button>
          {dishes.length ? (
            <div className="exlist" style={{ marginTop: 12 }}>
              {dishes.map(d => (
                <div className="foodrow" key={d.id}>
                  <button className="foodrow-main" onClick={() => onAddDish(d, meal)}>
                    <span className="foodrow-name">{d.name}</span>
                    <span className="foodrow-sub">{d.portion} г · Б {d.p} · Ж {d.f} · У {d.c}</span>
                  </button>
                  <span className="foodrow-kcal">{d.kcal}</span>
                  <button className="delbtn" onClick={() => { store.removeDish(d.id); force(x => x + 1) }} aria-label="Удалить"><Icon name="trash" size={16} /></button>
                </div>
              ))}
            </div>
          ) : <div className="empty" style={{ marginTop: 12 }}><Icon name="apple" size={28} /><p>Собери блюдо из нескольких продуктов и сохрани — добавляй в один тап.</p></div>}
        </>
      )}
      {tab === 'manual' && (
        <div className="manualcard">
          <label className="field"><span className="flabel">Название</span>
            <input value={mName} onChange={e => setMName(e.target.value)} placeholder="Напр. Домашний борщ" /></label>
          <div className="row2">
            <label className="field"><span className="flabel">Ккал</span>
              <input type="number" inputMode="numeric" value={mKcal} onChange={e => setMKcal(e.target.value)} placeholder="0" /></label>
            <label className="field"><span className="flabel">Белки, г</span>
              <input type="number" inputMode="numeric" value={mProt} onChange={e => setMProt(e.target.value)} placeholder="0" /></label>
          </div>
          <button className={'cta' + (mName && mKcal ? '' : ' disabled')} disabled={!(mName && mKcal)} onClick={() => onManual(mName, mKcal, mProt, meal)}>
            <Icon name="plus" size={18} /> Добавить в «{meal}»
          </button>
        </div>
      )}
    </div>
  )
}

function FoodList({ foods, fav, onPick, onFav }) {
  return (
    <div className="exlist">
      {foods.map(f => (
        <button className="exrow" key={f.id} onClick={() => onPick(f)}>
          <div className="exrow-main">
            <span className="exrow-name">{f.name}</span>
            <span className="exrow-sub">{f.kcal} ккал · 100 г · Б {f.p} Ж {f.f} У {f.c}</span>
          </div>
          {fav && onFav
            ? <span className={'favstar' + (fav.includes(f.id) ? ' on' : '')} onClick={e => onFav(e, f.id)}><Icon name="star" size={18} /></span>
            : <Icon name="plus" size={18} className="exrow-arr" />}
        </button>
      ))}
    </div>
  )
}

function DishBuilder({ onClose, onSaved }) {
  const [name, setName] = useState('')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const totals = items.reduce((a, it) => {
    const m = macrosFor(it.food, it.grams)
    return { kcal: a.kcal + m.kcal, p: a.p + m.p, f: a.f + m.f, c: a.c + m.c, g: a.g + it.grams }
  }, { kcal: 0, p: 0, f: 0, c: 0, g: 0 })
  function add(food) { setItems(arr => [...arr, { food, grams: food.portion || 100 }]) }
  function setG(i, g) { setItems(arr => arr.map((it, j) => j === i ? { ...it, grams: Math.max(1, g) } : it)) }
  function del(i) { setItems(arr => arr.filter((_, j) => j !== i)) }
  function save() {
    if (!name || !items.length) return
    store.addDish({ name, items: items.map(it => ({ foodId: it.food.id, grams: it.grams })), kcal: totals.kcal, p: totals.p, f: totals.f, c: totals.c, portion: totals.g })
    onSaved()
  }
  return (
    <div className="screen">
      <div className="addhead">
        <button className="iconbtn" onClick={onClose}><Icon name="back" size={20} /></button>
        <span className="addhead-t">Своё блюдо</span>
      </div>
      <label className="field"><span className="flabel">Название блюда</span>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Напр. Овсянка с бананом" /></label>
      {items.length > 0 && (
        <div className="dish-items">
          {items.map((it, i) => (
            <div className="dish-item" key={i}>
              <span className="dish-item-name">{it.food.name}</span>
              <div className="dish-item-g">
                <button className="iconbtn sm" onClick={() => setG(i, it.grams - 10)}><Icon name="minus" size={15} /></button>
                <span>{it.grams} г</span>
                <button className="iconbtn sm" onClick={() => setG(i, it.grams + 10)}><Icon name="plus" size={15} /></button>
              </div>
              <button className="delbtn" onClick={() => del(i)}><Icon name="trash" size={15} /></button>
            </div>
          ))}
          <div className="dish-total">Итого: <b>{totals.kcal} ккал</b> · Б {totals.p} · Ж {totals.f} · У {totals.c}</div>
        </div>
      )}
      <div className="searchbar">
        <Icon name="search" size={18} className="searchbar-ic" />
        <input className="searchinput" placeholder="Добавь продукт в блюдо…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {q && (
        <div className="exlist">
          {searchFoods(q).slice(0, 30).map(f => (
            <button className="exrow" key={f.id} onClick={() => add(f)}>
              <div className="exrow-main"><span className="exrow-name">{f.name}</span><span className="exrow-sub">{f.kcal} ккал · 100 г</span></div>
              <Icon name="plus" size={18} className="exrow-arr" />
            </button>
          ))}
        </div>
      )}
      <button className={'cta' + (name && items.length ? '' : ' disabled')} disabled={!(name && items.length)} onClick={save}>
        <Icon name="check" size={18} /> Сохранить блюдо
      </button>
    </div>
  )
}
