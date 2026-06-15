import Icon from './Icon.jsx'
import { MUSCLE_ART } from './muscleArt.js'
import { GROUP_META } from '../engine/exercises.js'

const HINT = {
  'нагружена сегодня': 'Мышца под нагрузкой — дай ей восстановиться.',
  'восстанавливается': 'Идёт восстановление. Можно лёгкую работу, но лучше дать отдых.',
  'свежая, пора грузить': 'Полностью восстановилась — отличный момент нагрузить.',
  'не качал': 'Ты ещё не тренировал эту группу. Самое время начать.'
}

export default function MuscleSheet({ group, days, status, onClose, onTrain, onExercises }) {
  const c = GROUP_META[group].color
  const hint = HINT[status] || (typeof days === 'number' ? 'Прошло ' + days + ' дн. с последней нагрузки.' : '')
  return (
    <div className="sheet" onClick={onClose}>
      <div className="sheet-card ms" onClick={e => e.stopPropagation()}>
        <div className="ms-grip" />
        <div className="ms-head">
          <span className="ms-img" style={{ boxShadow: `0 0 0 1px ${c}55, 0 8px 24px ${c}44` }}>
            <img src={MUSCLE_ART[group]} alt="" />
          </span>
          <div className="ms-meta">
            <span className="ms-name" style={{ color: c }}>{GROUP_META[group].label}</span>
            <span className="ms-status"><span className="ms-dot" style={{ background: c }} /> {status}</span>
            <p className="ms-hint">{hint}</p>
          </div>
        </div>
        <button className="cta" onClick={onTrain}><Icon name="dumbbell" size={18} /> Тренировка на эту группу</button>
        <button className="cta ghost-cta" onClick={onExercises}><Icon name="book" size={18} /> Упражнения и техника</button>
      </div>
    </div>
  )
}
