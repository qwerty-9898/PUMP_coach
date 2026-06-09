import { useState } from 'react'
import Icon from './Icon.jsx'
import { store, todayKey } from '../storage.js'

const FIELDS = [
  { k: 'weight', label: 'Вес, кг' },
  { k: 'chest', label: 'Грудь, см' },
  { k: 'waist', label: 'Талия, см' },
  { k: 'hip', label: 'Бёдра, см' },
  { k: 'biceps', label: 'Бицепс, см' }
]

export default function Measures() {
  const [list, setList] = useState(() => store.getMeasures())
  const [f, setF] = useState({})

  function save() {
    const entry = { date: todayKey() }
    let any = false
    for (const fl of FIELDS) { if (f[fl.k]) { entry[fl.k] = Number(f[fl.k]); any = true } }
    if (!any) return
    const next = [...list, entry]
    setList(next); store.setMeasures(next); setF({})
  }

  const last = list[list.length - 1]
  const prev = list[list.length - 2]

  return (
    <div className="screen">
      <div className="block-head"><h2 className="display sm">Новый замер</h2></div>
      <div className="measgrid">
        {FIELDS.map(fl => (
          <label className="field" key={fl.k}>
            <span className="flabel">{fl.label}</span>
            <input type="number" inputMode="decimal" value={f[fl.k] || ''} placeholder="—"
              onChange={e => setF(p => ({ ...p, [fl.k]: e.target.value }))} />
          </label>
        ))}
      </div>
      <button className="cta" onClick={save}><Icon name="check" size={18} /> Сохранить замер</button>

      {last && (
        <>
          <div className="block-head" style={{ marginTop: 22 }}><h2 className="display sm">Последний замер</h2></div>
          <div className="measlast">
            {FIELDS.filter(fl => last[fl.k] != null).map(fl => {
              const diff = prev && prev[fl.k] != null ? (last[fl.k] - prev[fl.k]) : null
              return (
                <div className="measrow" key={fl.k}>
                  <span>{fl.label}</span>
                  <b>{last[fl.k]}</b>
                  {diff != null && diff !== 0 && (
                    <span className={'measdiff ' + (diff > 0 ? 'up' : 'down')}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                    </span>
                  )}
                </div>
              )
            })}
            <span className="meas-date">{fmt(last.date)}</span>
          </div>
        </>
      )}

      {!last && (
        <div className="empty" style={{ marginTop: 18 }}>
          <Icon name="ruler" size={32} />
          <p>Запиши первый замер, чтобы потом видеть динамику. Делай раз в 1–2 недели в одно время.</p>
        </div>
      )}
    </div>
  )
}

function fmt(s) { return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) }
