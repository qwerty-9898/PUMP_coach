import { useState, useEffect } from 'react'
import Onboarding from './components/Onboarding.jsx'
import Home from './components/Home.jsx'
import Workout from './components/Workout.jsx'
import Nutrition from './components/Nutrition.jsx'
import Catalog from './components/Catalog.jsx'
import Progress from './components/Progress.jsx'
import Water from './components/Water.jsx'
import Measures from './components/Measures.jsx'
import Timer from './components/Timer.jsx'
import Calculators from './components/Calculators.jsx'
import Icon from './components/Icon.jsx'
import { store } from './storage.js'
import { initTelegram, tgBackButton, haptic, tgUserName } from './tg.js'

const TITLES = {
  home: '', workout: 'План тренировки', nutrition: 'Калории и КБЖУ',
  catalog: 'Каталог упражнений', progress: 'Прогресс', water: 'Дневник воды',
  measures: 'Замеры тела', timer: 'Таймер отдыха', calculators: 'Калькуляторы'
}

export default function App() {
  const [profile, setProfile] = useState(null)
  const [route, setRoute] = useState('home')

  useEffect(() => { initTelegram(); setProfile(store.getProfile()) }, [])

  // Нативная кнопка «Назад» Telegram
  useEffect(() => {
    if (route !== 'home' && profile) {
      const off = tgBackButton(true, () => go('home'))
      return off
    } else {
      tgBackButton(false)
    }
  }, [route, profile])

  function submit(p) { store.setProfile(p); setProfile(p); setRoute('home'); window.scrollTo(0, 0) }
  function resetProfile() { store.clearProfile(); setProfile(null); setRoute('home') }
  function go(r) { haptic('light'); setRoute(r); window.scrollTo(0, 0) }

  if (!profile) {
    return (
      <div className="app">
        <header className="topbar"><span className="logo">PUMP<span className="logo-dot">.</span></span></header>
        <Onboarding onSubmit={submit} />
        <footer className="foot">PUMP · v0.5 · Telegram Mini App</footer>
      </div>
    )
  }

  const screens = {
    home: <Home profile={profile} go={go} userName={tgUserName()} />,
    workout: <Workout profile={profile} />,
    nutrition: <Nutrition profile={profile} />,
    catalog: <Catalog profile={profile} />,
    progress: <Progress />,
    water: <Water profile={profile} />,
    measures: <Measures />,
    timer: <Timer />,
    calculators: <Calculators />
  }

  return (
    <div className="app">
      <header className="topbar">
        {route === 'home'
          ? <span className="logo">PUMP<span className="logo-dot">.</span></span>
          : <button className="iconbtn" onClick={() => go('home')} aria-label="Назад"><Icon name="back" size={22} /></button>}
        {route !== 'home' && <span className="topbar-title">{TITLES[route]}</span>}
        {route === 'home'
          ? <button className="ghost" onClick={resetProfile}>Профиль</button>
          : <span style={{ width: 36 }} />}
      </header>

      {screens[route]}

      <footer className="foot">PUMP · v0.5 · Telegram Mini App</footer>
    </div>
  )
}
