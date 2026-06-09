import { useState } from 'react'
import Icon from './Icon.jsx'
import { programsForEquip } from '../data/programs.js'

const FIT = {
  perfect: { cls: 'fit-good', icon: 'check' },
  ok: { cls: 'fit-ok', icon: 'info' },
  no: { cls: 'fit-no', icon: 'bolt' }
}
const EQUIP_LABEL = { none: 'без инвентаря', dumbbell: 'дома с гантелями', gym: 'в зале' }

export default function ProgramPicker({ selected, recommended, onSelect, equip }) {
  const list = programsForEquip(equip)
  const [openId, setOpenId] = useState(recommended)

  return (
    <section className="block">
      <div className="block-head">
        <h2 className="display sm">Выбери программу</h2>
        <p className="sub">Показаны программы под твои условия: <b className="accent">{EQUIP_LABEL[equip]}</b>.</p>
      </div>

      <div className="progs">
        {list.map(p => {
          const fit = FIT[p.fit]
          const open = openId === p.id
          const isSel = selected === p.id
          const isReco = recommended === p.id
          return (
            <div key={p.id} className={'prog' + (isSel ? ' sel' : '')}>
              <button className="prog-head" onClick={() => setOpenId(open ? null : p.id)}>
                <div className="prog-title">
                  <span className="prog-name">{p.name}</span>
                  <span className="prog-sub">{p.subtitle}</span>
                </div>
                <div className="prog-tags">
                  {isReco && <span className="badge reco">Тебе</span>}
                  <span className={'badge ' + fit.cls}><Icon name={fit.icon} size={12} /> {p.fitLabel}</span>
                  <Icon name="chevron" size={18} className={'prog-chev' + (open ? ' up' : '')} />
                </div>
              </button>
              {open && (
                <div className="prog-body">
                  <div className="prog-stats">
                    <div><span>Частота</span><b>{p.days}</b></div>
                    <div><span>Нагрузка</span><b>{p.freq}</b></div>
                  </div>
                  <p className="prog-about">{p.about}</p>
                  <div className="proscons">
                    <div className="pc pros"><span className="pc-h">Плюсы</span>
                      {p.pros.map((x, i) => <div key={i} className="pc-item"><Icon name="check" size={14} /> {x}</div>)}
                    </div>
                    <div className="pc cons"><span className="pc-h">Минусы</span>
                      {p.cons.map((x, i) => <div key={i} className="pc-item"><Icon name="minus" size={14} /> {x}</div>)}
                    </div>
                  </div>
                  <div className="forwhom">{p.forWhom}</div>
                  <button className={'cta sm' + (isSel ? ' done' : '')} onClick={() => onSelect(p.id)}>
                    {isSel ? 'Программа выбрана' : 'Выбрать эту программу'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
