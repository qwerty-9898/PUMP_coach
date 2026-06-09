import { useState } from 'react'
import Icon from './Icon.jsx'
import GroupBadge from './GroupBadge.jsx'
import { EXERCISES, GROUPS, GROUP_META, techExtras } from '../engine/exercises.js'

const EQUIP_LABEL = { none: 'Без инвентаря', dumbbell: 'Гантели', gym: 'Зал' }

export default function Catalog() {
  const [group, setGroup] = useState(null)
  const [exId, setExId] = useState(null)

  if (exId) {
    const ex = EXERCISES.find(e => e.id === exId)
    const x = techExtras(ex)
    return (
      <div className="screen">
        <button className="backrow" onClick={() => setExId(null)}><Icon name="back" size={18} /> К списку</button>
        <div className="detail-hero">
          <GroupBadge group={ex.group} size={54} />
          <div>
            <h2 className="display sm">{ex.name}</h2>
            <span className="detail-musc">{ex.muscles}</span>
          </div>
        </div>
        <div className="cattags">
          <span className="tag">{GROUP_META[ex.group].label}</span>
          <span className="tag">{EQUIP_LABEL[ex.equip]}</span>
          <span className="tag">{ex.level}</span>
          {ex.compound && <span className="tag base">базовое</span>}
        </div>

        <Section title="Техника по шагам">
          <ol className="cat-steps">{ex.technique.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </Section>
        <Section title="Частые ошибки" err>
          {ex.mistakes.map((m, i) => <div key={i} className="cat-err"><Icon name="x" size={13} /> {m}</div>)}
        </Section>
        <Section title="Темп, дыхание, разминка">
          <div className="cue"><Icon name="clock" size={15} /> {x.tempo}</div>
          <div className="cue"><Icon name="activity" size={15} /> {x.breathing}</div>
          <div className="cue"><Icon name="flame" size={15} /> {x.warmup}</div>
          <div className="cue"><Icon name="bolt" size={15} /> {x.focus}</div>
        </Section>
      </div>
    )
  }

  if (group) {
    const list = EXERCISES.filter(e => e.group === group)
    return (
      <div className="screen">
        <button className="backrow" onClick={() => setGroup(null)}><Icon name="back" size={18} /> Все группы</button>
        <div className="detail-hero">
          <GroupBadge group={group} size={48} />
          <div><h2 className="display sm">{GROUP_META[group].label}</h2><span className="detail-musc">{list.length} упражнений</span></div>
        </div>
        <div className="exlist">
          {list.map(ex => (
            <button className="exrow" key={ex.id} onClick={() => setExId(ex.id)}>
              <div className="exrow-main">
                <span className="exrow-name">{ex.name}</span>
                <span className="exrow-sub">{EQUIP_LABEL[ex.equip]} · {ex.level}{ex.compound ? ' · база' : ''}</span>
              </div>
              <Icon name="chevronR" size={18} className="exrow-arr" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      <p className="sub" style={{ marginTop: 0, marginBottom: 14 }}>Выбери группу мышц — внутри техника каждого упражнения и какие мышцы работают.</p>
      <div className="groupgrid">
        {GROUPS.map(g => {
          const cnt = EXERCISES.filter(e => e.group === g).length
          return (
            <button className="groupcard" key={g} onClick={() => setGroup(g)}>
              <GroupBadge group={g} size={46} />
              <span className="groupcard-name">{GROUP_META[g].label}</span>
              <span className="groupcard-cnt">{cnt} упр.</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Section({ title, err, children }) {
  return (
    <div className="cat-sect">
      <span className={'cat-h' + (err ? ' err' : '')}>{title}</span>
      {children}
    </div>
  )
}
