import { useState } from 'react'
import Icon from './Icon.jsx'

const GOALS = [
  { k: 'набор массы', icon: 'flame' },
  { k: 'похудение', icon: 'bolt' },
  { k: 'сила', icon: 'dumbbell' },
  { k: 'тонус', icon: 'target' }
]
const LEVELS = ['новичок', 'средний', 'продвинутый']
const PLACES = [
  { key: 'gym', label: 'В зале' },
  { key: 'dumbbell', label: 'Дома с гантелями' },
  { key: 'none', label: 'Без инвентаря' }
]
const DAYS = [2, 3, 4, 5, 6]
const STEPS = ['Пол', 'Параметры', 'Цель', 'Уровень', 'Место', 'Частота']

export default function Onboarding({ onSubmit }) {
  const [step, setStep] = useState(0)
  const [f, setF] = useState({
    gender: 'мужской', age: 22, weight: 75, height: 178,
    goal: 'набор массы', level: 'новичок', daysPerWeek: 3, equip: 'gym'
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const last = STEPS.length - 1

  function next() {
    if (step < last) { setStep(step + 1); window.scrollTo(0, 0) }
    else onSubmit({
      ...f,
      age: clamp(f.age, 14, 90, 22), weight: clamp(f.weight, 35, 250, 75),
      height: clamp(f.height, 120, 230, 178), daysPerWeek: Number(f.daysPerWeek)
    })
  }
  const back = () => step > 0 && setStep(step - 1)

  return (
    <div className="wizard">
      <div className="wiz-progress">
        {STEPS.map((s, i) => <span key={i} className={'wdot' + (i === step ? ' on' : '') + (i < step ? ' done' : '')} />)}
      </div>

      <div className="wiz-body">
        <span className="wiz-step">Шаг {step + 1} из {STEPS.length}</span>

        {step === 0 && (
          <Block title="Кто ты?" hint="Нужно для точного расчёта калорий.">
            <div className="seg">
              {['мужской', 'женский'].map(g => (
                <button key={g} className={'seg-btn' + (f.gender === g ? ' on' : '')} onClick={() => set('gender', g)}>{g}</button>
              ))}
            </div>
          </Block>
        )}

        {step === 1 && (
          <Block title="Твои параметры" hint="Возраст, вес и рост — основа всех расчётов.">
            <div className="row3">
              {[['age', 'Возраст'], ['weight', 'Вес, кг'], ['height', 'Рост, см']].map(([k, l]) => (
                <label className="field" key={k}>
                  <span className="flabel">{l}</span>
                  <input type="number" inputMode="numeric" value={f[k]} onChange={e => set(k, e.target.value)} />
                </label>
              ))}
            </div>
          </Block>
        )}

        {step === 2 && (
          <Block title="Какая цель?" hint="От неё зависят план, повторы и калории.">
            <div className="grid2">
              {GOALS.map(g => (
                <button key={g.k} className={'optcard' + (f.goal === g.k ? ' on' : '')} onClick={() => set('goal', g.k)}>
                  <Icon name={g.icon} size={20} /><span>{g.k}</span>
                </button>
              ))}
            </div>
          </Block>
        )}

        {step === 3 && (
          <Block title="Твой уровень" hint="Честно — от этого зависит сложность и веса.">
            <div className="seg">
              {LEVELS.map(l => (
                <button key={l} className={'seg-btn' + (f.level === l ? ' on' : '')} onClick={() => set('level', l)}>{l}</button>
              ))}
            </div>
          </Block>
        )}

        {step === 4 && (
          <Block title="Где тренируешься?" hint="Подберём упражнения под твой инвентарь.">
            <div className="pills col">
              {PLACES.map(p => (
                <button key={p.key} className={'pill' + (f.equip === p.key ? ' on' : '')} onClick={() => set('equip', p.key)}>{p.label}</button>
              ))}
            </div>
          </Block>
        )}

        {step === 5 && (
          <Block title="Сколько дней в неделю?" hint="Под это построим программу.">
            <div className="seg days">
              {DAYS.map(d => (
                <button key={d} className={'seg-btn' + (f.daysPerWeek === d ? ' on' : '')} onClick={() => set('daysPerWeek', d)}>{d}</button>
              ))}
            </div>
          </Block>
        )}
      </div>

      <div className="wiz-nav">
        {step > 0 && <button className="iconbtn big" onClick={back}><Icon name="back" size={22} /></button>}
        <button className="cta" onClick={next}>
          {step < last ? 'Далее' : 'Поехали'} <Icon name="arrow" size={18} />
        </button>
      </div>
    </div>
  )
}

function Block({ title, hint, children }) {
  return (
    <div className="wiz-q">
      <h1 className="display lg">{title}</h1>
      <p className="sub">{hint}</p>
      <div className="wiz-input">{children}</div>
    </div>
  )
}

function clamp(v, min, max, fb) {
  const n = Number(v); if (Number.isNaN(n)) return fb
  return Math.min(max, Math.max(min, n))
}
