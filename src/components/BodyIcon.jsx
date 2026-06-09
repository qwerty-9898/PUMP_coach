import frontImg from '../assets/skeleton/front.png'
import backImg from '../assets/skeleton/back.png'
import { GROUP_META } from '../engine/exercises.js'
import { FRONT_ZONES, BACK_ZONES, GROUP_VIEW } from './bodyZones.js'

// Мини-скелет с подсветкой зоны группы. size = высота в px.
export default function BodyIcon({ group, size = 40 }) {
  const view = GROUP_VIEW[group] || 'front'
  const img = view === 'back' ? backImg : frontImg
  const zones = (view === 'back' ? BACK_ZONES : FRONT_ZONES)[group] || []
  const color = GROUP_META[group]?.color || '#ff8a3d'
  return (
    <div className="bi-frame" style={{ height: Math.round(size * 1.5) }}>
      <img className="bi-img" src={img} alt="" />
      {zones.map((e, i) => (
        <span key={i} className="bi-zone" style={{
          left: e[0] + '%', top: e[1] + '%', width: e[2] + '%', height: e[3] + '%',
          background: `radial-gradient(closest-side, ${color}, transparent 70%)`
        }} />
      ))}
    </div>
  )
}
