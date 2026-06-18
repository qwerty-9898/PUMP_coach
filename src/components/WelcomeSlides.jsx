import { useState } from 'react'
import Icon from './Icon.jsx'

const SLIDES = [
  { icon: 'bolt', title: 'Добро пожаловать в PUMP', text: 'Твой карманный тренер: тренировки под цель, питание и прогресс — всё в одном приложении.' },
  { icon: 'dumbbell', title: 'Тренировки под тебя', text: 'Готовые программы, план на 4 недели и пошаговый гид с записью весов и авто-прогрессией.' },
  { icon: 'apple', title: 'Питание без боли', text: 'Считай калории: поиск, штрихкод, фото еды, идеи под остаток калорий и свои цели БЖУ.' },
  { icon: 'activity', title: 'Виден каждый шаг', text: 'Карта восстановления мышц, личные рекорды, медали и аналитика роста.' }
]

export default function WelcomeSlides({ onDone }) {
  const [i, setI] = useState(0)
  const s = SLIDES[i]
  const last = i === SLIDES.length - 1
  return (
    <div className="intro">
      <button className="intro-skip" onClick={onDone}>Пропустить</button>
      <div className="intro-body">
        <div className="intro-ic"><Icon name={s.icon} size={40} /></div>
        <h2 className="display lg" style={{ marginTop: 18 }}>{s.title}</h2>
        <p className="intro-text">{s.text}</p>
      </div>
      <div className="intro-dots">
        {SLIDES.map((_, k) => <span key={k} className={'intro-dot' + (k === i ? ' on' : '')} />)}
      </div>
      <button className="cta" onClick={() => (last ? onDone() : setI(i + 1))}>
        {last ? 'Поехали 💪' : 'Дальше'} {!last && <Icon name="arrow" size={18} />}
      </button>
    </div>
  )
}
