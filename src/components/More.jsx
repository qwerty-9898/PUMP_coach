import Icon from './Icon.jsx'

const ITEMS = [
  { route: 'nutrition', icon: 'flame', title: 'Калории и КБЖУ', sub: 'Дневник еды и БЖУ' },
  { route: 'water', icon: 'droplet', title: 'Дневник воды', sub: 'Норма и учёт за день' },
  { route: 'measures', icon: 'ruler', title: 'Замеры тела', sub: 'Вес и объёмы' },
  { route: 'timer', icon: 'timer', title: 'Таймер отдыха', sub: 'Между подходами' },
  { route: 'calculators', icon: 'calc', title: 'Калькуляторы', sub: '1ПМ и блины на штангу' }
]

export default function More({ go, onResetProfile }) {
  return (
    <div className="screen">
      <div className="cards">
        {ITEMS.map(c => (
          <button key={c.route} className="navcard" onClick={() => go(c.route)}>
            <span className="navcard-ic"><Icon name={c.icon} size={24} /></span>
            <span className="navcard-txt">
              <span className="navcard-title">{c.title}</span>
              <span className="navcard-sub">{c.sub}</span>
            </span>
            <span className="navcard-arr"><Icon name="chevronR" size={18} /></span>
          </button>
        ))}
        <button className="navcard" onClick={onResetProfile}>
          <span className="navcard-ic"><Icon name="user" size={24} /></span>
          <span className="navcard-txt">
            <span className="navcard-title">Профиль</span>
            <span className="navcard-sub">Изменить параметры и цель</span>
          </span>
          <span className="navcard-arr"><Icon name="chevronR" size={18} /></span>
        </button>
      </div>
      <p className="more-foot">PUMP · v0.6 · Telegram Mini App</p>
    </div>
  )
}
