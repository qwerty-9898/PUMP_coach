import Icon from './Icon.jsx'
import MenuIcon from './MenuIcon.jsx'
import { store, calcStreak } from '../storage.js'

const SECTIONS = [
  {
    label: 'Тело и питание',
    rows: [
      { route: 'nutrition', icon: 'nutrition', title: 'Калории и КБЖУ', sub: 'Дневник еды и БЖУ', color: '#ff5a1f' },
      { route: 'water',     icon: 'water',     title: 'Дневник воды',   sub: 'Норма и учёт за день', color: '#3b82f6' },
      { route: 'measures',  icon: 'measures',  title: 'Замеры тела',    sub: 'Вес и объёмы', color: '#ec4899' }
    ]
  },
  {
    label: 'Инструменты',
    rows: [
      { route: 'timer',       icon: 'timer',       title: 'Таймер отдыха', sub: 'Между подходами', color: '#a855f7' },
      { route: 'calculators', icon: 'calculators', title: 'Калькуляторы',  sub: '1ПМ и блины на штангу', color: '#f59e0b' },
      { route: 'catalog',     icon: 'catalog',     title: 'Каталог',       sub: 'Техника упражнений', color: '#22c55e' }
    ]
  }
]

export default function More({ go, profile, userName }) {
  const initial = (userName || 'А').trim().charAt(0).toUpperCase()
  const streak = calcStreak(store.getProgress().workouts.map(w => w.date))
  const total = store.getProgress().workouts.length
  const ton = store.getLogs().reduce((a, l) => a + l.sets.reduce((s, x) => s + (x.w || 0) * (x.r || 0), 0), 0)

  function reloadApp() { window.location.reload() }
  function wipeAll() {
    if (window.confirm('Стереть все данные приложения? Профиль, прогресс, еда, замеры и избранное удалятся безвозвратно.')) {
      store.clearAll(); window.location.reload()
    }
  }

  return (
    <div className="screen">
      <button className="profilecard" onClick={() => go('profile')}>
        <span className="pc-ava">{initial}</span>
        <div className="pc-main">
          <div className="pc-row">
            <span className="pc-name">{userName || 'Атлет'}</span>
            <Icon name="chevronR" size={18} className="pc-arr" />
          </div>
          <span className="pc-sub">{cap(profile?.level)} · цель: {profile?.goal || '—'}</span>
          <div className="pc-stats">
            <div className="pc-stat"><b>{streak}</b><span>серия</span></div>
            <div className="pc-stat"><b>{total}</b><span>тренировок</span></div>
            <div className="pc-stat"><b>{fmtKg(ton)}</b><span>поднято</span></div>
          </div>
        </div>
      </button>

      {SECTIONS.map(sec => (
        <div className="more-sect" key={sec.label}>
          <span className="more-lbl">{sec.label}</span>
          <div className="more-list">
            {sec.rows.map(r => (
              <button className="more-row" key={r.route} onClick={() => go(r.route)}>
                <span className="mr-ic" style={{ color: r.color, background: hexA(r.color, 0.15) }}>
                  <MenuIcon name={r.icon} size={24} />
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
            <span className="mr-ic" style={{ color: '#9aa6b8', background: 'rgba(154,166,184,.15)' }}><MenuIcon name="reload" size={24} /></span>
            <span className="mr-txt">
              <span className="mr-title">Перезагрузить приложение</span>
              <span className="mr-sub">Обновить, если что-то подвисло</span>
            </span>
          </button>
          <button className="more-row danger" onClick={wipeAll}>
            <span className="mr-ic" style={{ color: '#ff5a5a', background: 'rgba(255,90,90,.15)' }}><MenuIcon name="trash" size={24} /></span>
            <span className="mr-txt">
              <span className="mr-title">Стереть все данные</span>
              <span className="mr-sub">Сбросить профиль, прогресс и дневники</span>
            </span>
          </button>
        </div>
      </div>

      <p className="more-foot">PUMP · v1.0 · Telegram Mini App</p>
    </div>
  )
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Новичок' }
function fmtKg(kg) { return kg >= 1000 ? (kg / 1000).toFixed(1) + ' т' : Math.round(kg) + ' кг' }
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'
}
