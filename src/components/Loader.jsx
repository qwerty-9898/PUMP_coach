import { useState, useEffect } from 'react'

const STEPS = ['Анализируем твои данные', 'Подбираем программу под цель', 'Готовим упражнения и веса', 'Почти готово']

export default function Loader() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 620)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="loader">
      <div className="loader-logo">PUMP<span className="logo-dot">.</span></div>
      <div className="loader-bar"><div className="loader-fill" /></div>
      <p className="loader-step" key={step}>{STEPS[step]}…</p>
    </div>
  )
}
