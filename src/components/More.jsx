import Icon from './Icon.jsx'

const TILES = [
  { route: 'nutrition',   icon: 'flame',  title: 'Калории и КБЖУ', sub: 'Дневник еды',     color: '#ff5a1f' },
  { route: 'water',       icon: 'droplet', title: 'Дневник воды',  sub: 'Норма за день',   color: '#3b82f6' },
  { route: 'measures',    icon: 'ruler',  title: 'Замеры тела',    sub: 'Вес и объёмы',    color: '#ec4899' },
  { route: 'timer',       icon: 'timer',  title: 'Таймер отдыха',  sub: 'Между подходами', color: '#a855f7' },
  { route: 'calculators', icon: 'calc',   title: 'Калькуляторы',   sub: '1ПМ и блины',     color: '#f59e0b' },
  { route: 'catalog',     icon: 'book',   title: 'Каталог',        sub: 'Техника упр.',    color: '#22c55e' }
]

export default function More({ go, profile, userName }) {
  const initial = (userName || 'А').trim().charAt(0).toUpperCase()
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

      <div className="tilegrid">
        {TILES.map(t => (
          <button key={t.route} className="tile" onClick={() => go(t.route)}>
            <span className="tile-ic" style={{ color: t.color, background: hexA(t.color, 0.14) }}>
              <Icon name={t.icon} size={24} />
            </span>
            <span className="tile-title">{t.title}</span>
            <span className="tile-sub">{t.sub}</span>
          </button>
        ))}
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
