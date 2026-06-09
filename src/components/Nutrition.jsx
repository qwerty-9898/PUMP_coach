import { useState } from 'react'
import Icon from './Icon.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { searchFoods, macrosFor } from '../data/foods.js'
import { store, todayKey } from '../storage.js'

const MEALS = [
  { key: 'Завтрак', icon: 'apple' },
  { key: 'Обед', icon: 'apple' },
  { key: 'Ужин', icon: 'apple' },
  { key: 'Перекус', icon: 'apple' }
]

export default function Nutrition({ profile }) {
  const goal = calcNutrition(profile)
  const date = todayKey()
  const [tick, setTick] = useState(0)
  const [addMeal, setAddMeal] = useState(null) // активный приём для добавления
  const refresh = () => setTick(t => t + 1)

  const entries = store.getFoodDay(date)
  const eaten = entries.reduce((a, e) => ({
    kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c
  }), { kcal: 0, p: 0, f: 0, c: 0 })
  const left = Math.max(0, goal.kcal - eaten.kcal)
  const pct = Math.min(100, Math.round((eaten.kcal / goal.kcal) * 100))

  function addEntry(food, grams, meal) {
    const m = macrosFor(food, grams)
    store.addFood(date, { foodId: food.id, name: food.name, grams, meal, ...m })
    setAddMeal(null); refresh()
  }
  function addManual(name, kcal, p, meal) {
    store.addFood(date, { foodId: null, name, grams: 0, meal, kcal, p: p || 0, f: 0, c: 0 })
    setAddMeal(null); refresh()
  }
  function remove(uid) { store.removeFood(date, uid); refresh() }

  if (addMeal) {
    return <AddPanel meal={addMeal} onAdd={addEntry} onManual={addManual} onClose={() => setAddMeal(null)} onFav={refresh} />
  }

  return (
    <div className="screen">
      <div className="ring-card">
        <div className="kring" style={{ '--pct': pct + '%' }}>
          <div className="kring-in">
            <span className="kring-num">{eaten.kcal}</span>
            <span className="kring-lbl">съедено</span>
            <span className="kring-goal">из {goal.kcal} ккал</span>
          </div>
        </div>
        <div className="ring-side">
          <div className="rs"><span>Осталось</span><b className="accent">{left}</b></div>
          <div className="rs"><span>Цель</span><b>{goal.kcal}</b></div>
        </div>
      </div>

      <div className="mbars">
        <MacroBar label="Белки" val={eaten.p} goal={goal.protein} color="#3b82f6" />
        <MacroBar label="Углеводы" val={eaten.c} goal={goal.carbs} color="#f59e0b" />
        <MacroBar label="Жиры" val={eaten.f} goal={goal.fat} color="#ec4899" />
      </div>

      {MEALS.map(meal => {
        const list = entries.filter(e => e.meal === meal.key)
        const sum = list.reduce((a, e) => a + e.kcal, 0)
        return (
          <div className="mealblock" key={meal.key}>
            <div className="mealblock-head">
              <span className="mealblock-name">{meal.key}</span>
              <span className="mealblock-sum">{sum} ккал</span>
              <button className="addbtn" onClick={() => setAddMeal(meal.key)} aria-label="Добавить"><Icon name="plus" size={18} /></button>
            </div>
            {list.length > 0 && (
              <div className="mealblock-items">
                {list.map(e => (
                  <div className="foodrow" key={e.uid}>
                    <div className="foodrow-main">
                      <span className="foodrow-name">{e.name}</span>
                      <span className="foodrow-sub">{e.grams ? e.grams + ' г · ' : ''}Б {e.p} · Ж {e.f} · У {e.c}</span>
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

      <div className="tipcard soon">
        <span className="tip-ic"><Icon name="apple" size={18} /></span>
        <div>
          <span className="tip-h">Скоро: счётчик по фото</span>
          <p>Сфоткал тарелку — приложение само посчитает калории и КБЖУ. В разработке.</p>
        </div>
      </div>
    </div>
  )
}

function MacroBar({ label, val, goal, color }) {
  const pct = Math.min(100, goal ? Math.round((val / goal) * 100) : 0)
  return (
    <div className="mbar">
      <div className="mbar-top"><span>{label}</span><b>{val} / {goal} г</b></div>
      <div className="mbar-track"><div className="mbar-fill" style={{ width: pct + '%', background: color }} /></div>
    </div>
  )
}

function AddPanel({ meal, onAdd, onManual, onClose, onFav }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [grams, setGrams] = useState(100)
  const [manual, setManual] = useState(false)
  const [mName, setMName] = useState('')
  const [mKcal, setMKcal] = useState('')
  const [mProt, setMProt] = useState('')
  const [favTick, setFavTick] = useState(0)

  const fav = store.getFavorites()
  let results = searchFoods(q)
  // избранное вперёд
  results = [...results].sort((a, b) => (fav.includes(b.id) ? 1 : 0) - (fav.includes(a.id) ? 1 : 0))

  function pick(food) { setSel(food); setGrams(food.portion || 100) }
  function toggleFav(e, id) { e.stopPropagation(); store.toggleFavorite(id); setFavTick(t => t + 1); onFav && onFav() }

  if (sel) {
    const m = macrosFor(sel, grams)
    return (
      <div className="screen">
        <div className="addhead">
          <button className="iconbtn" onClick={() => setSel(null)}><Icon name="back" size={20} /></button>
          <span className="addhead-t">{sel.name}</span>
        </div>
        <div className="portioncard">
          <span className="flabel">Порция, грамм</span>
          <div className="portion-row">
            <button className="iconbtn big" onClick={() => setGrams(g => Math.max(5, g - 10))}><Icon name="minus" size={20} /></button>
            <input type="number" inputMode="numeric" value={grams} onChange={e => setGrams(Math.max(1, Number(e.target.value) || 0))} />
            <button className="iconbtn big" onClick={() => setGrams(g => g + 10)}><Icon name="plus" size={20} /></button>
          </div>
          <div className="portion-quick">
            {[50, 100, 150, 200].map(g => (
              <button key={g} className={'qchip' + (grams === g ? ' on' : '')} onClick={() => setGrams(g)}>{g} г</button>
            ))}
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

  return (
    <div className="screen">
      <div className="addhead">
        <button className="iconbtn" onClick={onClose}><Icon name="back" size={20} /></button>
        <span className="addhead-t">Добавить в «{meal}»</span>
      </div>

      <div className="searchbar">
        <Icon name="search" size={18} className="searchbar-ic" />
        <input className="searchinput" placeholder="Найди еду: марс, гречка, курица…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <button className="manual-toggle" onClick={() => setManual(m => !m)}>
        <Icon name="edit" size={16} /> {manual ? 'Скрыть ручной ввод' : 'Своё блюдо вручную'}
      </button>

      {manual && (
        <div className="manualcard">
          <input className="searchinput" placeholder="Название" value={mName} onChange={e => setMName(e.target.value)} />
          <div className="manual-row">
            <input type="number" inputMode="numeric" placeholder="Ккал" value={mKcal} onChange={e => setMKcal(e.target.value)} />
            <input type="number" inputMode="numeric" placeholder="Белки, г" value={mProt} onChange={e => setMProt(e.target.value)} />
          </div>
          <button className={'cta sm' + (mName && mKcal ? '' : ' disabled')} disabled={!(mName && mKcal)}
            onClick={() => onManual(mName, Number(mKcal), Number(mProt), meal)}>Добавить вручную</button>
        </div>
      )}

      <div className="foodlist">
        {results.map(food => (
          <button className="fooditem" key={food.id} onClick={() => pick(food)}>
            <div className="fooditem-main">
              <span className="fooditem-name">{food.name}</span>
              <span className="fooditem-sub">{food.kcal} ккал/100г · Б {food.p} Ж {food.f} У {food.c}</span>
            </div>
            <span className={'favstar' + (fav.includes(food.id) ? ' on' : '')} onClick={(e) => toggleFav(e, food.id)}>
              <Icon name="star" size={18} />
            </span>
            <Icon name="plus" size={18} className="fooditem-add" />
          </button>
        ))}
        {results.length === 0 && <div className="empty"><p>Ничего не нашёл. Добавь вручную выше.</p></div>}
      </div>
    </div>
  )
}
