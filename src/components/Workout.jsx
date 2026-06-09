import { useState } from 'react'
import ProgramPicker from './ProgramPicker.jsx'
import WorkoutBuilder from './WorkoutBuilder.jsx'
import WeekSchedule from './WeekSchedule.jsx'
import { PROGRAMS, recommendProgram } from '../data/programs.js'

export default function Workout({ profile }) {
  const recommended = recommendProgram(profile)
  const [programId, setProgramId] = useState(null)
  const program = PROGRAMS.find(p => p.id === programId)

  function changeProgram() { setProgramId(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="screen">
      {!program && <ProgramPicker selected={programId} recommended={recommended} onSelect={setProgramId} />}
      {program && <>
        <WeekSchedule program={program} profile={profile} />
        <WorkoutBuilder key={program.id} program={program} profile={profile} onChangeProgram={changeProgram} />
      </>}
    </div>
  )
}
