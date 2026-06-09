import { useState } from 'react'
import Icon from './Icon.jsx'

const GOALS = [
  { k: 'набор массы', icon: 'flame' }, { k: 'похудение', icon: 'bolt' },
  { k: 'сила', icon: 'dumbbell' }, { k: 'тонус', icon: 'target' }
]
const LEVELS = ['новичок', 'средний', 'продвинутый']
const PLACES = [{ key: 'gym', label: 'В зале' }, { key: 'dumbbell', label: 'Дома с гантелями' }, { key: 'none', label: 'Без инвентаря' }]
const DAYS = [2, 3, 4, 5, 6]

export default function Profile({ profile, onSave, onRestart }) {
  const [f, setF] = useState({ ...profile })
  const [saved, setSaved] = useState(false)
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setSaved(false) }

  function save() {
    onSave({
      ...f,
      age: clamp(f.age, 14, 90, profile.age), weight: clamp(f.weight, 35, 250, profile.weight),
      height: clamp(f.height, 120, 230, profile.height), daysPerWeek: Number(f.daysPerWeek)
    })
    setSaved(true)
  }

  return (
    <div className="screen">
      <p className="sub" style={{ marginTop: 0, marginBottom: 16 }}>Меняй параметры на лету — программа и калории пересчитаются автоматически.</p>

      <div className="field"><span className="flabel">Пол</span>
        <div className="seg">{['мужской', 'женский'].map(g => (
          <button key={g} className={'seg-btn' + (f.gender === g ? ' on' : '')} onClick={() => set('gender', g)}>{g}</button>))}
        </div>
      </div>

      <div className="row3">
        {[['age', 'Возраст'], ['weight', 'Вес, кг'], ['height', 'Рост, см']].map(([k, l]) => (
          <label className="field" key={k}><span className="flabel">{l}</span>
            <input type="number" inputMode="numeric" value={f[k]} onChange={e => set(k, e.target.value)} /></label>))}
      </div>

      <div className="field"><span className="flabel">Цель</span>
        <div className="grid2">{GOALS.map(g => (
          <button key={g.k} className={'optcard' + (f.goal === g.k ? ' on' : '')} onClick={() => set('goal', g.k)}>
            <Icon name={g.icon} size={20} /><span>{g.k}</span></button>))}
        </div>
      </div>

      <div className="field"><span className="flabel">Уровень</span>
        <div className="seg">{LEVELS.map(l => (
          <button key={l} className={'seg-btn' + (f.level === l ? ' on' : '')} onClick={() => set('level', l)}>{l}</button>))}
        </div>
      </div>

      <div className="field"><span className="flabel">Где тренируешься</span>
        <div className="pills">{PLACES.map(p => (
          <button key={p.key} className={'pill' + (f.equip === p.key ? ' on' : '')} onClick={() => set('equip', p.key)}>{p.label}</button>))}
        </div>
      </div>

      <div className="field"><span className="flabel">Дней в неделю</span>
        <div className="seg days">{DAYS.map(d => (
          <button key={d} className={'seg-btn' + (f.daysPerWeek === d ? ' on' : '')} onClick={() => set('daysPerWeek', d)}>{d}</button>))}
        </div>
      </div>

      <button className={'cta' + (saved ? ' done' : '')} onClick={save}>
        {saved ? <><Icon name="check" size={18} /> Сохранено</> : <><Icon name="check" size={18} /> Сохранить изменения</>}
      </button>
      <button className="cta ghost-cta" style={{ marginTop: 10 }} onClick={onRestart}>Пройти знакомство заново</button>
    </div>
  )
}

function clamp(v, min, max, fb) { const n = Number(v); if (Number.isNaN(n)) return fb; return Math.min(max, Math.max(min, n)) }
