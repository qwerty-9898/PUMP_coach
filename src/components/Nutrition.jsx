import { useState } from 'react'
import Icon from './Icon.jsx'
import SparkChart from './SparkChart.jsx'
import { calcNutrition } from '../engine/nutrition.js'
import { FOODS, searchFoods, macrosFor } from '../data/foods.js'
import { store, todayKey } from '../storage.js'

const MEALS = ['Завтрак', 'Обед', 'Ужин', 'Перекус']
const byId = Object.fromEntries(FOODS.map(f => [f.id, f]))

export default function Nutrition({ profile }) {
  const auto = calcNutrition(profile)
  const date = todayKey()
  const [tick, setTick] = useState(0)
  const [addMeal, setAddMeal] = useState(null)
  const [editUid, setEditUid] = useState(null)
  const [editGoal, setEditGoal] = useState(false)
  const refresh = () => setTick(t => t + 1)

  const override = store.getKcalGoal()
  const goalKcal = override || auto.kcal
  const protein = auto.protein, fat = auto.fat
  const carbs = Math.max(0, Math.round((goalKcal - protein * 4 - fat * 9) / 4))

  const entries = store.getFoodDay(date)
  const eaten = entries.reduce((a, e) => ({ kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c }), { kcal: 0, p: 0, f: 0, c: 0 })
  const left = Math.max(0, goalKcal - eaten.kcal)
  const pct = Math.min(100, Math.round((eaten.kcal / goalKcal) * 100))
  const week = store.foodWeek(7)

  function addEntry(food, grams, meal) {
    store.addFood(date, { foodId: food.id, name: food.name, grams, meal, ...macrosFor(food, grams) })
    setAddMeal(null); refresh()
  }
  function addDishEntry(dish, meal) {
    store.addFood(date, { foodId: null, name: dish.name, grams: dish.portion, meal, kcal: dish.kcal, p: dish.p, f: dish.f, c: dish.c })
    setAddMeal(null); refresh()
  }
  function addManual(name, kcal, p, meal) {
    store.addFood(date, { foodId: null, name, grams: 0, meal, kcal: Number(kcal) || 0, p: Number(p) || 0, f: 0, c: 0 })
    setAddMeal(null); refresh()
  }
  function remove(uid) { store.removeFood(date, uid); refresh() }

  if (addMeal) {
    return <AddPanel meal={addMeal} onAdd={addEntry} onAddDish={addDishEntry} onManual={addManual} onClose={() => setAddMeal(null)} onChange={refresh} />
  }

  const editEntry = editUid ? entries.find(e => e.uid === editUid) : null

  return (
    <div className="screen">
      <div className="ring-card">
        <div className="kring" style={{ '--pct': pct + '%' }}>
          <div className="kring-in">
            <span className="kring-num">{eaten.kcal}</span>
            <span className="kring-lbl">съедено</span>
            <span className="kring-goal">из {goalKcal} ккал</span>
          </div>
        </div>
        <div className="ring-side">
          <div className="rs"><span>Осталось</span><b className="accent">{left}</b></div>
          <button className="goal-edit" onClick={() => setEditGoal(v => !v)}><Icon name="edit" size={14} /> Цель</button>
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

      <div className="mbars">
        <MacroBar label="Белки" val={eaten.p} goal={protein} color="#3b82f6" />
        <MacroBar label="Углеводы" val={eaten.c} goal={carbs} color="#f59e0b" />
        <MacroBar label="Жиры" val={eaten.f} goal={fat} color="#ec4899" />
      </div>

      {week.some(d => d.kcal > 0) && (
        <div className="card">
          <span className="card-kicker" style={{ marginBottom: 10, display: 'inline-flex' }}><Icon name="activity" size={15} /> Калории за 7 дней</span>
          <SparkChart data={week.map(d => d.kcal)} unit="" />
        </div>
      )}

      {MEALS.map(meal => {
        const list = entries.filter(e => e.meal === meal)
        const sum = list.reduce((a, e) => a + e.kcal, 0)
        return (
          <div className="mealblock" key={meal}>
            <div className="mealblock-head">
              <span className="mealblock-name">{meal}</span>
              <span className="mealblock-sum">{sum} ккал</span>
              <button className="addbtn" onClick={() => setAddMeal(meal)} aria-label="Добавить"><Icon name="plus" size={18} /></button>
            </div>
            {list.length > 0 && (
              <div className="mealblock-items">
                {list.map(e => (
                  <div className="foodrow" key={e.uid}>
                    <button className="foodrow-main" onClick={() => setEditUid(e.uid)}>
                      <span className="foodrow-name">{e.name}</span>
                      <span className="foodrow-sub">{e.grams ? e.grams + ' г · ' : ''}Б {e.p} · Ж {e.f} · У {e.c}</span>
                    </button>
                    <span className="foodrow-kcal">{e.kcal}</span>
                    <button className="delbtn" onClick={() => remove(e.uid)} aria-label="Удалить"><Icon name="trash" size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {editEntry && <PortionEdit entry={editEntry} onSave={(grams) => {
        const food = byId[editEntry.foodId]
        if (food) store.updateFood(date, editEntry.uid, { grams, ...macrosFor(food, grams) })
        setEditUid(null); refresh()
      }} onClose={() => setEditUid(null)} />}

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

// Редактор порции уже добавленного продукта
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
  { k: 'search', label: 'Поиск' },
  { k: 'recent', label: 'Частые' },
  { k: 'fav', label: 'Избранное' },
  { k: 'dishes', label: 'Мои блюда' },
  { k: 'manual', label: 'Вручную' }
]

function AddPanel({ meal, onAdd, onAddDish, onManual, onClose, onChange }) {
  const [tab, setTab] = useState('search')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [grams, setGrams] = useState(100)
  const [building, setBuilding] = useState(false)
  const [mName, setMName] = useState(''); const [mKcal, setMKcal] = useState(''); const [mProt, setMProt] = useState('')
  const [, force] = useState(0)

  const fav = store.getFavorites()
  function pick(food) { setSel(food); setGrams(food.portion || 100) }
  function toggleFav(e, id) { e.stopPropagation(); store.toggleFavorite(id); force(x => x + 1); onChange && onChange() }

  if (building) return <DishBuilder meal={meal} onClose={() => setBuilding(false)} onSaved={() => { setBuilding(false); setTab('dishes') }} />

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
            <input className="searchinput" placeholder="Найди еду: гречка, банан, шаурма…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <FoodList foods={searchFoods(q).slice(0, 60)} fav={fav} onPick={pick} onFav={toggleFav} />
        </>
      )}
      {tab === 'recent' && (recent.length ? <FoodList foods={recent} fav={fav} onPick={pick} onFav={toggleFav} />
        : <div className="empty"><Icon name="flame" size={28} /><p>Тут появятся продукты, которые ты добавляешь чаще всего.</p></div>)}
      {tab === 'fav' && (favList.length ? <FoodList foods={favList} fav={fav} onPick={pick} onFav={toggleFav} />
        : <div className="empty"><Icon name="star" size={28} /><p>Отмечай продукты звёздочкой — они появятся здесь для быстрого доступа.</p></div>)}
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
          ) : <div className="empty" style={{ marginTop: 12 }}><Icon name="apple" size={28} /><p>Собери блюдо из нескольких продуктов и сохрани — добавляй его в один тап.</p></div>}
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
          <span className={'favstar' + (fav.includes(f.id) ? ' on' : '')} onClick={e => onFav(e, f.id)}><Icon name="star" size={18} /></span>
        </button>
      ))}
    </div>
  )
}

// Конструктор своего блюда
function DishBuilder({ meal, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [q, setQ] = useState('')
  const [items, setItems] = useState([]) // {food, grams}
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
