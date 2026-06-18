import { useState } from 'react'
import ProgramPicker from './ProgramPicker.jsx'
import ProgramPlan from './ProgramPlan.jsx'
import WorkoutBuilder from './WorkoutBuilder.jsx'
import WeekSchedule from './WeekSchedule.jsx'
import Icon from './Icon.jsx'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store } from '../storage.js'

export default function Workout({ profile, initialGroup, initialPlan }) {
  const recommended = recommendProgram(profile)
  const [programId, setProgramId] = useState(() => store.getActiveProgram() || null)
  const [showPlan, setShowPlan] = useState(!!initialPlan)
  const [dayGroups, setDayGroups] = useState(null)
  const program = PROGRAMS.find(p => p.id === programId)
  function select(id) { store.setActiveProgram(id); setProgramId(id) }
  function changeProgram() { setProgramId(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function startDay(groups) { setDayGroups(groups); setShowPlan(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  if (program && showPlan) {
    return <ProgramPlan profile={profile} programId={program.id} onStartDay={startDay} onClose={() => setShowPlan(false)} />
  }

  return (
    <div className="screen">
      {!program && <ProgramPicker selected={programId || store.getActiveProgram()} recommended={recommended} onSelect={select} equip={profile.equip} />}
      {program && <>
        <button className="plan-cta" onClick={() => setShowPlan(true)}>
          <span className="plan-cta-ic"><Icon name="flag" size={18} /></span>
          <span className="plan-cta-txt"><b>План на 4 недели</b><small>мезоцикл под цель с прогрессией</small></span>
          <Icon name="chevronR" size={18} />
        </button>
        <WeekSchedule program={program} profile={profile} />
        <WorkoutBuilder key={program.id + (dayGroups ? '|' + dayGroups.join(',') : '')} program={program} profile={profile} initialGroup={initialGroup} initialGroups={dayGroups} onChangeProgram={changeProgram} />
      </>}
    </div>
  )
}
