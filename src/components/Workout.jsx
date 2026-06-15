import { useState } from 'react'
import ProgramPicker from './ProgramPicker.jsx'
import WorkoutBuilder from './WorkoutBuilder.jsx'
import WeekSchedule from './WeekSchedule.jsx'
import { PROGRAMS, recommendProgram } from '../data/programs.js'
import { store } from '../storage.js'

export default function Workout({ profile }) {
  const recommended = recommendProgram(profile)
  const [programId, setProgramId] = useState(() => store.getActiveProgram() || null)
  const program = PROGRAMS.find(p => p.id === programId)
  function select(id) { store.setActiveProgram(id); setProgramId(id) }

  function changeProgram() { setProgramId(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="screen">
      {!program && <ProgramPicker selected={programId || store.getActiveProgram()} recommended={recommended} onSelect={select} equip={profile.equip} />}
      {program && <>
        <WeekSchedule program={program} profile={profile} />
        <WorkoutBuilder key={program.id} program={program} profile={profile} onChangeProgram={changeProgram} />
      </>}
    </div>
  )
}
