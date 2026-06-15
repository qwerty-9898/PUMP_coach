import { useState } from 'react'
import Icon from './Icon.jsx'
import muscleBg from '../assets/skeleton/muscle_front.png'
import { programsForEquip } from '../data/programs.js'

const FIT = {
  perfect: { cls: 'fit-good', icon: 'check' },
  ok: { cls: 'fit-ok', icon: 'info' },
  no: { cls: 'fit-no', icon: 'bolt' }
}
const EQUIP_LABEL = { none: 'без инвентаря', dumbbell: 'дома с гантелями', gym: 'в зале' }

export default function ProgramPicker({ selected, recommended, onSelect, equip }) {
  const list = programsForEquip(equip)
  const reco = list.find(p => p.id === recommended) || list[0]
  const others = list.filter(p => p.id !== reco.id)
  const [openId, setOpenId] = useState(null)

  return (
    <section className="block">
      <div className="block-head">
        <h2 className="display sm">Выбери программу</h2>
        <p className="sub">Под твои условия: <b className="accent">{EQUIP_LABEL[equip]}</b></p>
      </div>

      {/* Рекомендованная — герой */}
      <div className={'prog-hero' + (selected === reco.id ? ' sel' : '')}>
        <img className="prog-hero-bg" src={muscleBg} alt="" aria-hidden="true" />
        <span className="prog-hero-badge"><Icon name="bolt" size={13} /> Рекомендуем тебе</span>
        <h3 className="prog-hero-name">{reco.name}</h3>
        <p className="prog-hero-sub">{reco.subtitle}</p>
        <div className="prog-hero-stats">
          <span><Icon name="calc" size={14} /> {reco.days}</span>
          <span><Icon name="activity" size={14} /> {reco.freq}</span>
        </div>
        <div className="prog-hero-pros">
          {reco.pros.slice(0, 2).map((x, i) => <div key={i}><Icon name="check" size={13} /> {x}</div>)}
        </div>
        <button className={'cta' + (selected === reco.id ? ' done' : '')} onClick={() => onSelect(reco.id)}>
          {selected === reco.id ? <><Icon name="check" size={18} /> Программа выбрана</> : 'Выбрать эту программу'}
        </button>
      </div>

      <span className="more-lbl" style={{ margin: '18px 4px 10px' }}>Другие программы</span>
      <div className="proglist">
        {others.map(p => {
          const fit = FIT[p.fit]
          const open = openId === p.id
          const isSel = selected === p.id
          return (
            <div key={p.id} className={'progrow' + (isSel ? ' sel' : '')}>
              <button className="progrow-head" onClick={() => setOpenId(open ? null : p.id)}>
                <div className="progrow-main">
                  <span className="progrow-name">{p.name}</span>
                  <span className="progrow-sub">{p.subtitle}</span>
                </div>
                <span className={'badge ' + fit.cls}><Icon name={fit.icon} size={11} /> {p.fitLabel}</span>
                <Icon name="chevron" size={17} className={'progrow-chev' + (open ? ' up' : '')} />
              </button>
              {open && (
                <div className="progrow-body">
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
