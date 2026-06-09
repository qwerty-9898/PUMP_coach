import { useState } from 'react'
import Icon from './Icon.jsx'
import { store, todayKey } from '../storage.js'

export default function Water({ profile }) {
  const goalMl = Math.round(profile.weight * 30) // 30 мл на кг
  const key = todayKey()
  const [ml, setMl] = useState(() => store.getWater()[key] || 0)

  function add(amount) {
    const next = Math.max(0, ml + amount)
    setMl(next)
    const w = store.getWater(); w[key] = next; store.setWater(w)
  }

  const pct = Math.min(100, Math.round((ml / goalMl) * 100))

  return (
    <div className="screen">
      <div className="watercard">
        <div className="water-ring" style={{ '--pct': pct + '%' }}>
          <div className="water-inner">
            <span className="water-ml">{(ml / 1000).toFixed(1)}<small> л</small></span>
            <span className="water-goal">из {(goalMl / 1000).toFixed(1)} л</span>
          </div>
        </div>
        <p className="water-pct">{pct}% дневной нормы</p>
      </div>

      <div className="water-btns">
        <button className="wbtn" onClick={() => add(250)}>+250 мл</button>
        <button className="wbtn" onClick={() => add(500)}>+500 мл</button>
        <button className="wbtn ghosty" onClick={() => add(-250)}><Icon name="minus" size={16} /> 250</button>
      </div>

      <div className="tipcard">
        <span className="tip-ic"><Icon name="droplet" size={18} /></span>
        <div>
          <span className="tip-h">Твоя норма: {(goalMl / 1000).toFixed(1)} л</span>
          <p>Считается как 30 мл на кг веса. В тренировочные дни пей чуть больше — вода держит силу и восстановление.</p>
        </div>
      </div>
    </div>
  )
}
