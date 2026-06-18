import { useState } from 'react'
import Icon from './Icon.jsx'
import MenuIcon from './MenuIcon.jsx'
import muscleBg from '../assets/skeleton/muscle_front.png'
import { store } from '../storage.js'
import { shareText } from '../tg.js'

const TOOLS = [
  { route: 'water', icon: 'water', title: 'Дневник воды', sub: 'Норма и учёт за день', color: '#3b82f6' },
  { route: 'measures', icon: 'measures', title: 'Замеры тела', sub: 'Вес, объёмы и фото', color: '#ec4899' },
  { route: 'timer', icon: 'timer', title: 'Таймер отдыха', sub: 'Между подходами', color: '#a855f7' },
  { route: 'calculators', icon: 'calculators', title: 'Калькуляторы', sub: '1ПМ и блины на штангу', color: '#f59e0b' }
]
const PLACE = { gym: 'Зал', dumbbell: 'Дом + гантели', none: 'Без инвентаря' }

export default function More({ go, profile, userName }) {
  const initial = (userName || 'А').trim().charAt(0).toUpperCase()
  const measures = store.getMeasures().filter(m => m.weight != null)
  const curW = (measures.length ? measures[measures.length - 1].weight : profile?.weight) || 0
  const [gw, setGw] = useState(() => store.getGoalWeight())

  function setGoalWeight() {
    const v = window.prompt('Желаемый вес, кг:', gw || curW)
    if (v === null) return
    const n = Number(v)
    store.setGoalWeight(n > 0 ? n : null); setGw(n > 0 ? n : null)
  }
  function reloadApp() { window.location.reload() }
  function showTour() { store.setIntroSeen(false); window.location.reload() }
  function shareApp() { shareText('🔥 Качаюсь в PUMP — тренировки под цель + калории в одном. Залетай 💪') }
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

  const diff = gw ? Math.round((curW - gw) * 10) / 10 : 0
  const lose = gw && curW > gw

  return (
    <div className="screen">
      {/* Профиль-герой: личность + параметры (не дублируем статистику Прогресса) */}
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
          <div className="ph-s"><b>{profile?.weight || '—'}</b><span>вес, кг</span></div>
          <div className="ph-s"><b>{profile?.height || '—'}</b><span>рост, см</span></div>
          <div className="ph-s"><b>{profile?.daysPerWeek || '—'}</b><span>дней/нед</span></div>
        </div>
        <button className="ph-edit" onClick={() => go('profile')}><Icon name="edit" size={15} /> Изменить параметры</button>
      </div>

      {/* Цель по весу */}
      <div className="card goalw-card">
        <div className="goalw-head">
          <span className="card-kicker"><Icon name="target" size={15} /> Цель по весу</span>
          <button className="goalw-set" onClick={setGoalWeight}>{gw ? 'Изменить' : 'Поставить'}</button>
        </div>
        {gw ? (
          <div className="goalw-body">
            <div className="goalw-nums">
              <div><b>{curW}</b><span>сейчас</span></div>
              <Icon name="arrow" size={18} className="goalw-arrow" />
              <div><b className="accent">{gw}</b><span>цель</span></div>
            </div>
            <span className="goalw-rem">
              {Math.abs(diff) < 0.5 ? 'Цель достигнута! 🔥' : (lose ? 'Сбросить ещё ' + Math.abs(diff) + ' кг' : 'Набрать ещё ' + Math.abs(diff) + ' кг')}
            </span>
          </div>
        ) : (
          <p className="sub" style={{ margin: '8px 0 0' }}>Поставь желаемый вес — покажу, сколько осталось, а динамику веди в «Замерах».</p>
        )}
      </div>

      <div className="more-sect">
        <span className="more-lbl">Инструменты</span>
        <div className="more-list">
          {TOOLS.map(r => (
            <button className="more-row" key={r.route} onClick={() => go(r.route)}>
              <span className="mr-ic" style={{ color: r.color, background: hexA(r.color, 0.15) }}><MenuIcon name={r.icon} size={24} /></span>
              <span className="mr-txt"><span className="mr-title">{r.title}</span><span className="mr-sub">{r.sub}</span></span>
              <span className="mr-arr"><Icon name="chevronR" size={18} /></span>
            </button>
          ))}
        </div>
      </div>

      <div className="more-sect">
        <span className="more-lbl">Данные</span>
        <div className="more-list">
          <button className="more-row" onClick={backupData}>
            <span className="mr-ic" style={{ color: '#22c55e', background: 'rgba(34,197,94,.15)' }}><Icon name="share" size={22} /></span>
            <span className="mr-txt"><span className="mr-title">Сохранить бэкап</span><span className="mr-sub">Скачать все данные одним файлом</span></span>
          </button>
          <label className="more-row">
            <span className="mr-ic" style={{ color: '#3b82f6', background: 'rgba(59,130,246,.15)' }}><Icon name="refresh" size={22} /></span>
            <span className="mr-txt"><span className="mr-title">Восстановить из файла</span><span className="mr-sub">Загрузить бэкап на новом устройстве</span></span>
            <input type="file" accept="application/json,.json" hidden onChange={restoreData} />
          </label>
        </div>
      </div>

      <div className="more-sect">
        <span className="more-lbl">Приложение</span>
        <div className="more-list">
          <button className="more-row" onClick={shareApp}>
            <span className="mr-ic" style={{ color: '#ff5a1f', background: 'rgba(255,90,31,.15)' }}><Icon name="share" size={22} /></span>
            <span className="mr-txt"><span className="mr-title">Поделиться приложением</span><span className="mr-sub">Позови друга тренироваться</span></span>
          </button>
          <button className="more-row" onClick={showTour}>
            <span className="mr-ic" style={{ color: '#a855f7', background: 'rgba(168,85,247,.15)' }}><Icon name="info" size={22} /></span>
            <span className="mr-txt"><span className="mr-title">Показать тур заново</span><span className="mr-sub">Знакомство с разделами</span></span>
          </button>
        </div>
      </div>

      <div className="more-sect">
        <span className="more-lbl">Система</span>
        <div className="more-list">
          <button className="more-row" onClick={reloadApp}>
            <span className="mr-ic" style={{ color: '#9aa6b8', background: 'rgba(154,166,184,.15)' }}><MenuIcon name="reload" size={24} /></span>
            <span className="mr-txt"><span className="mr-title">Перезагрузить приложение</span><span className="mr-sub">Обновить, если что-то подвисло</span></span>
          </button>
          <button className="more-row danger" onClick={wipeAll}>
            <span className="mr-ic" style={{ color: '#ff5a5a', background: 'rgba(255,90,90,.15)' }}><MenuIcon name="trash" size={24} /></span>
            <span className="mr-txt"><span className="mr-title">Стереть все данные</span><span className="mr-sub">Сбросить профиль, прогресс и дневники</span></span>
          </button>
        </div>
      </div>

      <p className="more-foot">PUMP · v3.2 · Telegram Mini App</p>
    </div>
  )
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Новичок' }
function hexA(hex, a) {
  const n = parseInt(hex.slice(1), 16)
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'
}
