import { useState } from 'react'
import Icon from './Icon.jsx'
import GroupBadge from './GroupBadge.jsx'
import { EXERCISES, GROUPS, GROUP_META } from '../engine/exercises.js'

const EQUIP_LABEL = { none: 'Без инвентаря', dumbbell: 'Гантели', gym: 'Зал' }

export default function Catalog() {
  const [group, setGroup] = useState('все')
  const [openId, setOpenId] = useState(null)

  const list = group === 'все' ? EXERCISES : EXERCISES.filter(e => e.group === group)

  return (
    <div className="screen">
      <p className="sub" style={{ marginTop: 0 }}>База упражнений с техникой и разбором: что работает и как не накосячить.</p>

      <div className="filterbar">
        <button className={'fpill' + (group === 'все' ? ' on' : '')} onClick={() => setGroup('все')}>Все</button>
        {GROUPS.map(g => (
          <button key={g} className={'fpill' + (group === g ? ' on' : '')} onClick={() => setGroup(g)}>
            {GROUP_META[g].label}
          </button>
        ))}
      </div>

      <div className="catlist">
        {list.map(ex => {
          const open = openId === ex.id
          return (
            <div className={'catitem' + (open ? ' open' : '')} key={ex.id}>
              <button className="catitem-head" onClick={() => setOpenId(open ? null : ex.id)}>
                <GroupBadge group={ex.group} size={40} />
                <div className="catitem-main">
                  <span className="catitem-name">{ex.name}</span>
                  <span className="catitem-musc">{ex.muscles}</span>
                </div>
                <Icon name="chevron" size={18} className={'catitem-chev' + (open ? ' up' : '')} />
              </button>

              {open && (
                <div className="catitem-body">
                  <div className="cattags">
                    <span className="tag">{GROUP_META[ex.group].label}</span>
                    <span className="tag">{EQUIP_LABEL[ex.equip]}</span>
                    <span className="tag">{ex.level}</span>
                    {ex.compound && <span className="tag base">базовое</span>}
                  </div>

                  <div className="cat-sect">
                    <span className="cat-h">Техника</span>
                    <ol className="cat-steps">
                      {ex.technique.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>

                  <div className="cat-sect">
                    <span className="cat-h err">Частые ошибки</span>
                    {ex.mistakes.map((m, i) => (
                      <div key={i} className="cat-err"><Icon name="x" size={13} /> {m}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
