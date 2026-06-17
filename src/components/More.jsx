import Icon from './Icon.jsx'
import MenuIcon from './MenuIcon.jsx'
import muscleBg from '../assets/skeleton/muscle_front.png'
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

  function backupData() {
    try {
      const blob = new Blob([JSON.stringify({ app: 'PUMP', v: 1, ts: Date.now(), data: store.exportAll() })], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'pump-backup-' + new Date().toISOString().slice(0, 10) + '.json'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)
    } catch (e) { window.alert('Не удалось создать бэкап.') }
  }
  function restoreData(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return
    const rd = new FileReader()
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result)
        const data = j && j.data ? j.data : j
        if (store.importAll(data) && window.confirm('Данные восстановлены. Перезагрузить приложение?')) window.location.reload()
        else if (!data) window.alert('Файл не похож на бэкап PUMP.')
      } catch (_) { window.alert('Файл повреждён или неверный формат.') }
    }
    rd.readAsText(file)
  }

  return (
    <div className="screen">
      {/* Профиль-герой */}
      <div className="profilehero">
        <img className="ph-bg" src={muscleBg} alt="" aria-hidden="true" />
        <div className="ph-top">
          <span className="ph-ava2">{initial}</span>
          <div className="ph-info">
            <span className="ph-name2">{userName || 'Атлет'}</span>
            <div className="ph-chips">
              <span className="ph-chip">{cap(profile?.level)}</span>
              <span className="ph-chip">Цель: {profile?.goal || '—'}</span>
            </div>
          </div>
        </div>
        <div className="ph-stats3">
          <div className="ph-s"><b>{streak}</b><span>серия</span></div>
          <div className="ph-s"><b>{total}</b><span>тренировок</span></div>
          <div className="ph-s"><b>{fmtKg(ton)}</b><span>поднято</span></div>
        </div>
        <button className="ph-edit" onClick={() => go('profile')}><Icon name="edit" size={15} /> Изменить профиль</button>
      </div>

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
        <span className="more-lbl">Данные</span>
        <div className="more-list">
          <button className="more-row" onClick={backupData}>
            <span className="mr-ic" style={{ color: '#22c55e', background: 'rgba(34,197,94,.15)' }}><Icon name="share" size={22} /></span>
            <span className="mr-txt">
              <span className="mr-title">Сохранить бэкап</span>
              <span className="mr-sub">Скачать все данные одним файлом</span>
            </span>
          </button>
          <label className="more-row">
            <span className="mr-ic" style={{ color: '#3b82f6', background: 'rgba(59,130,246,.15)' }}><Icon name="refresh" size={22} /></span>
            <span className="mr-txt">
              <span className="mr-title">Восстановить из файла</span>
              <span className="mr-sub">Загрузить бэкап на новом устройстве</span>
            </span>
            <input type="file" accept="application/json,.json" hidden onChange={restoreData} />
          </label>
        </div>
      </div>

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

      <p className="more-foot">PUMP · v2.0 · Telegram Mini App</p>
    </div>
  )
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Новичок' }
function fmtKg(kg) { return kg >= 1000 ? (kg / 1000).toFixed(1) + ' т' : Math.round(kg) + ' кг' }
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'
}
