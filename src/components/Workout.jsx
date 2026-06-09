import { useState } from 'react'
import ProgramPicker from './ProgramPicker.jsx'
import WorkoutBuilder from './WorkoutBuilder.jsx'
import { PROGRAMS, recommendProgram } from '../data/programs.js'

export default function Workout({ profile }) {
  const recommended = recommendProgram(profile)
  const [programId, setProgramId] = useState(null)
  const program = PROGRAMS.find(p => p.id === programId)

  return (
    <div className="screen">
      <ProgramPicker selected={programId} recommended={recommended} onSelect={setProgramId} />
      {program && <WorkoutBuilder key={program.id} program={program} profile={profile} />}
    </div>
  )
}
