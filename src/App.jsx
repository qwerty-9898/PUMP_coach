import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding.jsx'
import Home from './components/Home.jsx'
import Workout from './components/Workout.jsx'
import Catalog from './components/Catalog.jsx'
import Progress from './components/Progress.jsx'
import More from './components/More.jsx'
import Profile from './components/Profile.jsx'
import Nutrition from './components/Nutrition.jsx'
import Water from './components/Water.jsx'
import Measures from './components/Measures.jsx'
import Timer from './components/Timer.jsx'
import Calculators from './components/Calculators.jsx'
import Loader from './components/Loader.jsx'
import Icon from './components/Icon.jsx'
import NavIcon from './components/NavIcon.jsx'
import bgBody from './assets/skeleton/muscle_front.png'
import { store } from './storage.js'
import { initTelegram, tgBackButton, haptic, tgUserName } from './tg.js'

const TABS = [
  { key: 'home', label: 'Главная', icon: 'home' },
  { key: 'workout', label: 'Тренировки', icon: 'dumbbell' },
  { key: 'catalog', label: 'Каталог', icon: 'book' },
  { key: 'progress', label: 'Прогресс', icon: 'activity' },
  { key: 'more', label: 'Ещё', icon: 'grid' }
]
const SECONDARY = {
  profile: 'Профиль', nutrition: 'Калории и КБЖУ', water: 'Дневник воды',
  measures: 'Замеры тела', timer: 'Таймер отдыха', calculators: 'Калькуляторы'
}
const TAB_TITLE = { workout: 'Тренировки', catalog: 'Каталог упражнений', progress: 'Прогресс', more: 'Ещё' }

export default function App() {
  const [profile, setProfile] = useState(null)
  const [route, setRoute] = useState('home')
  const [loading, setLoading] = useState(false)
  const [catGroup, setCatGroup] = useState(null)

  useEffect(() => { initTelegram(); setProfile(store.getProfile()) }, [])

  const isSecondary = route in SECONDARY
  useEffect(() => {
    if (isSecondary && profile) { const off = tgBackButton(true, () => go('more')); return off }
    tgBackButton(false)
  }, [route, profile])

  function submit(p) { store.setProfile(p); setProfile(p); setRoute('home'); setLoading(true); setTimeout(() => setLoading(false), 2600); window.scrollTo(0, 0) }
  function saveProfile(p) { store.setProfile(p); setProfile(p) }
  function restart() { store.clearProfile(); setProfile(null); setRoute('home') }
  function go(r) { haptic('light'); if (r === 'catalog') setCatGroup(null); setRoute(r); window.scrollTo(0, 0) }
  function openMuscle(g) { haptic('light'); setCatGroup(g); setRoute('catalog'); window.scrollTo(0, 0) }

  if (loading) return <div className="app"><Loader /></div>

  if (!profile) {
    return (
      <div className="app">
        <header className="topbar"><span className="logo">PUMP<span className="logo-dot">.</span></span></header>
        <Onboarding onSubmit={submit} />
      </div>
    )
  }

  const screens = {
    home: <Home profile={profile} go={go} onMuscle={openMuscle} userName={tgUserName()} />,
    workout: <Workout profile={profile} />,
    catalog: <Catalog key={catGroup || 'all'} initialGroup={catGroup} />,
    progress: <Progress profile={profile} />,
    more: <More go={go} />,
    profile: <Profile profile={profile} onSave={saveProfile} onRestart={restart} />,
    nutrition: <Nutrition profile={profile} />,
    water: <Water profile={profile} />,
    measures: <Measures />,
    timer: <Timer />,
    calculators: <Calculators />
  }
  const activeTab = isSecondary ? 'more' : route

  return (
    <div className="app withnav">
      <div className="app-bg" aria-hidden="true" style={{ backgroundImage: `url(${bgBody})` }} />
      <header className="topbar">
        {isSecondary ? (
          <>
            <button className="iconbtn" onClick={() => go('more')} aria-label="Назад"><Icon name="back" size={22} /></button>
            <span className="topbar-title">{SECONDARY[route]}</span>
            <span style={{ width: 38 }} />
          </>
        ) : route === 'home' ? (
          <span className="logo">PUMP<span className="logo-dot">.</span></span>
        ) : (
          <span className="topbar-title solo">{TAB_TITLE[route]}</span>
        )}
      </header>

      <main className="content">{screens[route]}</main>

      <nav className="tabbar">
        {TABS.map(t => (
          <button key={t.key} className={'tab' + (activeTab === t.key ? ' on' : '')} onClick={() => go(t.key)}>
            <NavIcon name={t.key} size={24} active={activeTab === t.key} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
