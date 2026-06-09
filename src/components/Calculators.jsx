import { useState } from 'react'
import Icon from './Icon.jsx'

const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25]

export default function Calculators() {
  const [tab, setTab] = useState('1rm')
  return (
    <div className="screen">
      <div className="seg" style={{ marginBottom: 18 }}>
        <button className={'seg-btn' + (tab === '1rm' ? ' on' : '')} onClick={() => setTab('1rm')}>1ПМ</button>
        <button className={'seg-btn' + (tab === 'plate' ? ' on' : '')} onClick={() => setTab('plate')}>Блины на штангу</button>
      </div>
      {tab === '1rm' ? <OneRM /> : <PlateCalc />}
    </div>
  )
}

function OneRM() {
  const [w, setW] = useState(60)
  const [r, setR] = useState(5)
  const orm = Math.round(w * (1 + r / 30))
  const pcts = [95, 90, 85, 80, 70, 60, 50]
  return (
    <div>
      <div className="block-head"><h2 className="display sm">Расчёт одноповторного максимума</h2>
        <p className="sub">Введи рабочий вес и повторы — посчитаем максимум (формула Эпли).</p></div>
      <div className="grid2">
        <label className="field"><span className="flabel">Вес, кг</span>
          <input type="number" inputMode="decimal" value={w} onChange={e => setW(Math.max(1, Number(e.target.value) || 0))} /></label>
        <label className="field"><span className="flabel">Повторы</span>
          <input type="number" inputMode="numeric" value={r} onChange={e => setR(Math.max(1, Number(e.target.value) || 0))} /></label>
      </div>
      <div className="ormbig">Твой 1ПМ: <b className="accent">{orm} кг</b></div>
      <div className="block-head" style={{ marginTop: 18 }}><span className="flabel">Проценты от максимума</span></div>
      <div className="pcttable">
        {pcts.map(p => (
          <div className="pctrow" key={p}>
            <span>{p}%</span><b>{Math.round(orm * p / 100)} кг</b>
            <span className="pcthint">{p >= 85 ? 'сила' : p >= 67 ? 'масса' : 'выносливость'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlateCalc() {
  const [target, setTarget] = useState(60)
  const [bar, setBar] = useState(20)
  const perSide = Math.max(0, (target - bar) / 2)
  let rest = perSide
  const used = []
  for (const pl of PLATES) {
    let count = 0
    while (rest >= pl - 0.001) { rest = Math.round((rest - pl) * 100) / 100; count++ }
    if (count) used.push({ pl, count })
  }
  return (
    <div>
      <div className="block-head"><h2 className="display sm">Калькулятор блинов</h2>
        <p className="sub">Сколько блинов вешать на каждую сторону штанги.</p></div>
      <div className="grid2">
        <label className="field"><span className="flabel">Нужный вес, кг</span>
          <input type="number" inputMode="decimal" value={target} onChange={e => setTarget(Math.max(0, Number(e.target.value) || 0))} /></label>
        <label className="field"><span className="flabel">Гриф, кг</span>
          <input type="number" inputMode="decimal" value={bar} onChange={e => setBar(Math.max(0, Number(e.target.value) || 0))} /></label>
      </div>
      <div className="ormbig">На каждую сторону: <b className="accent">{fmt(perSide)} кг</b></div>
      {target < bar ? (
        <div className="empty" style={{ marginTop: 14 }}><p>Цель меньше веса грифа.</p></div>
      ) : rest > 0.01 ? (
        <div className="empty" style={{ marginTop: 14 }}><p>Точно не набрать стандартными блинами (остаток {fmt(rest)} кг на сторону).</p></div>
      ) : (
        <div className="plates">
          {used.map(u => (
            <div className="platerow" key={u.pl}>
              <span className="platedisc">{fmt(u.pl)}</span>
              <span className="platecount">× {u.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function fmt(x) { return Number.isInteger(x) ? x : x.toFixed(2).replace(/0$/, '') }
