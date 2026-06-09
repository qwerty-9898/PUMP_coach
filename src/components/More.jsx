import Icon from './Icon.jsx'
import { store } from '../storage.js'

const SECTIONS = [
  {
    label: 'Тело и питание',
    rows: [
      { route: 'nutrition', icon: 'flame',   title: 'Калории и КБЖУ', sub: 'Дневник еды и БЖУ', color: '#ff5a1f' },
      { route: 'water',     icon: 'droplet', title: 'Дневник воды',   sub: 'Норма и учёт за день', color: '#3b82f6' },
      { route: 'measures',  icon: 'ruler',   title: 'Замеры тела',    sub: 'Вес и объёмы', color: '#ec4899' }
    ]
  },
  {
    label: 'Инструменты',
    rows: [
      { route: 'timer',       icon: 'timer', title: 'Таймер отдыха', sub: 'Между подходами', color: '#a855f7' },
      { route: 'calculators', icon: 'calc',  title: 'Калькуляторы',  sub: '1ПМ и блины на штангу', color: '#f59e0b' },
      { route: 'catalog',     icon: 'book',  title: 'Каталог упражнений', sub: 'Техника по группам мышц', color: '#22c55e' }
    ]
  }
]

export default function More({ go, profile, userName }) {
  const initial = (userName || 'А').trim().charAt(0).toUpperCase()

  function reloadApp() { window.location.reload() }
  function wipeAll() {
    if (window.confirm('Стереть все данные приложения? Профиль, прогресс, еда, замеры и избранное удалятся безвозвратно.')) {
      store.clearAll(); window.location.reload()
    }
  }

  return (
    <div className="screen">
      <button className="card profile-head" onClick={() => go('profile')}>
        <span className="ph-ava">{initial}</span>
        <div className="ph-txt">
          <span className="ph-name">{userName || 'Атлет'}</span>
          <span className="ph-sub">{cap(profile?.level)} · цель: {profile?.goal || '—'}</span>
        </div>
        <span className="ph-arr"><Icon name="chevronR" size={20} /></span>
      </button>

      {SECTIONS.map(sec => (
        <div className="more-sect" key={sec.label}>
          <span className="more-lbl">{sec.label}</span>
          <div className="more-list">
            {sec.rows.map(r => (
              <button className="more-row" key={r.route} onClick={() => go(r.route)}>
                <span className="mr-ic" style={{ color: r.color, background: hexA(r.color, 0.14) }}>
                  <Icon name={r.icon} size={22} />
                </span>
                <span className="mr-txt">
                  <span className="mr-title">{r.title}</span>
                  <span className="mr-sub">{r.sub}</span>
                </span>
                <span className="mr-arr"><Icon name="chevronR" size={18} /></span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="more-sect">
        <span className="more-lbl">Система</span>
        <div className="more-list">
          <button className="more-row" onClick={reloadApp}>
            <span className="mr-ic" style={{ color: '#98a2b3', background: 'rgba(152,162,179,.14)' }}>
              <Icon name="refresh" size={22} />
            </span>
            <span className="mr-txt">
              <span className="mr-title">Перезагрузить приложение</span>
              <span className="mr-sub">Обновить, если что-то подвисло</span>
            </span>
          </button>
          <button className="more-row danger" onClick={wipeAll}>
            <span className="mr-ic" style={{ color: '#ff5a5a', background: 'rgba(255,90,90,.14)' }}>
              <Icon name="trash" size={22} />
            </span>
            <span className="mr-txt">
              <span className="mr-title">Стереть все данные</span>
              <span className="mr-sub">Сбросить профиль, прогресс и дневники</span>
            </span>
          </button>
        </div>
      </div>

      <p className="more-foot">PUMP · v0.8 · Telegram Mini App</p>
    </div>
  )
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Новичок' }
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
