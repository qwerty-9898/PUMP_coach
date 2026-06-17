import { useState, useMemo } from 'react'
import Icon from './Icon.jsx'
import { MUSCLE_ART } from './muscleArt.js'
import { Hl, MuscleThumb } from './MuscleThumb.jsx'
import { EXERCISES, GROUPS, GROUP_META, techExtras } from '../engine/exercises.js'
import { openLink } from '../tg.js'

const EQUIP_LABEL = { none: 'Без инвентаря', dumbbell: 'Гантели', gym: 'Зал' }
const EQUIP_SHORT = { all: 'Все', gym: 'Зал', dumbbell: 'Гантели', none: 'Без инвентаря' }

function norm(s) { return (s || '').toLowerCase().replace(/ё/g, 'е') }

function ExRow({ ex, showGroup, onOpen }) {
  return (
    <button className="exrow" onClick={onOpen}>
      <MuscleThumb group={ex.group} className="exrow-thumb" />
      <div className="exrow-main">
        <span className="exrow-name">{ex.name}</span>
        <span className="exrow-sub">
          {showGroup && <b style={{ color: GROUP_META[ex.group].color }}>{GROUP_META[ex.group].label}</b>}
          {showGroup && ' · '}{EQUIP_LABEL[ex.equip]} · {ex.level}{ex.compound ? ' · база' : ''}
        </span>
      </div>
      <Icon name="chevronR" size={18} className="exrow-arr" />
    </button>
  )
}

export default function Catalog({ initialGroup }) {
  const [group, setGroup] = useState(initialGroup || null)
  const [exId, setExId] = useState(null)
  const [q, setQ] = useState('')
  const [filt, setFilt] = useState('all')

  // ===== Детальная карточка упражнения =====
  if (exId) {
    const ex = EXERCISES.find(e => e.id === exId)
    const x = techExtras(ex)
    return (
      <div className="screen">
        <button className="backrow" onClick={() => setExId(null)}><Icon name="back" size={18} /> К списку</button>
        <div className="muscle-hero" style={{ '--mc': GROUP_META[ex.group].color }}>
          <div className="muscle-hero-art">
            <img className="muscle-hero-img" src={MUSCLE_ART[ex.group]} alt="" />
            <Hl group={ex.group} />
          </div>
          <div className="muscle-hero-info">
            <span className="muscle-tagline">{GROUP_META[ex.group].label}</span>
            <h2 className="display sm" style={{ marginTop: 4 }}>{ex.name}</h2>
            <span className="detail-musc">{ex.muscles}</span>
            <div className="cattags">
              <span className="tag">{EQUIP_LABEL[ex.equip]}</span>
              <span className="tag">{ex.level}</span>
              {ex.compound && <span className="tag base">базовое</span>}
            </div>
          </div>
        </div>

        <button className="cta video-cta" onClick={() => openLink('https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.name + ' техника упражнения'))}>
          <Icon name="play" size={18} /> Смотреть видео техники
        </button>

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

  // ===== Список упражнений группы =====
  if (group) {
    const all = EXERCISES.filter(e => e.group === group)
    const equips = ['all', ...['gym', 'dumbbell', 'none'].filter(eq => all.some(e => e.equip === eq))]
    const list = filt === 'all' ? all : all.filter(e => e.equip === filt)
    const base = list.filter(e => e.compound), iso = list.filter(e => !e.compound)
    return (
      <div className="screen">
        <button className="backrow" onClick={() => { setGroup(null); setFilt('all') }}><Icon name="back" size={18} /> Все группы</button>
        <div className="muscle-banner" style={{ '--mc': GROUP_META[group].color }}>
          <img className="muscle-banner-img" src={MUSCLE_ART[group]} alt="" />
          <Hl group={group} />
          <div className="muscle-banner-scrim" />
          <div className="muscle-banner-info">
            <h2 className="display md">{GROUP_META[group].label}</h2>
            <span className="muscle-banner-cnt">{all.length} упражнений · {all.filter(e => e.compound).length} базовых</span>
          </div>
        </div>

        {equips.length > 2 && (
          <div className="catfilter">
            {equips.map(eq => (
              <button key={eq} className={'catchip' + (filt === eq ? ' on' : '')} onClick={() => setFilt(eq)}>{EQUIP_SHORT[eq]}</button>
            ))}
          </div>
        )}

        {base.length > 0 && <div className="exgroup-lbl">Базовые</div>}
        <div className="exlist">
          {base.map(ex => <ExRow key={ex.id} ex={ex} onOpen={() => setExId(ex.id)} />)}
        </div>
        {iso.length > 0 && <div className="exgroup-lbl">Изолирующие</div>}
        <div className="exlist">
          {iso.map(ex => <ExRow key={ex.id} ex={ex} onOpen={() => setExId(ex.id)} />)}
        </div>
      </div>
    )
  }

  // ===== Главная каталога: поиск + сетка групп =====
  const results = useMemo(() => {
    const n = norm(q.trim())
    if (n.length < 2) return []
    return EXERCISES.filter(e => norm(e.name).includes(n) || norm(e.muscles).includes(n) || norm(GROUP_META[e.group].label).includes(n)).slice(0, 40)
  }, [q])

  return (
    <div className="screen">
      <div className="catsearch">
        <Icon name="search" size={18} className="catsearch-ico" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Найти упражнение…" />
        {q && <button className="catsearch-x" onClick={() => setQ('')}><Icon name="x" size={15} /></button>}
      </div>

      {q.trim().length >= 2 ? (
        <>
          <span className="more-lbl" style={{ margin: '2px 2px 8px', display: 'block' }}>{results.length ? 'Найдено: ' + results.length : 'Ничего не нашлось'}</span>
          <div className="exlist">
            {results.map(ex => <ExRow key={ex.id} ex={ex} showGroup onOpen={() => setExId(ex.id)} />)}
          </div>
          {!results.length && <div className="empty-mini">Попробуй другое слово — например «жим», «тяга» или «присед».</div>}
        </>
      ) : (
        <>
          <p className="sub" style={{ marginTop: 0, marginBottom: 14 }}>Выбери группу мышц — внутри техника каждого упражнения и какие мышцы работают.</p>
          <div className="musclegrid">
            {GROUPS.map(g => {
              const cnt = EXERCISES.filter(e => e.group === g).length
              return (
                <button className="musclecard" key={g} style={{ '--mc': GROUP_META[g].color }} onClick={() => setGroup(g)}>
                  <img className="musclecard-img" src={MUSCLE_ART[g]} alt="" />
                  <Hl group={g} />
                  <div className="musclecard-scrim" />
                  <div className="musclecard-info">
                    <span className="musclecard-name">{GROUP_META[g].label}</span>
                    <span className="musclecard-cnt">{cnt} упражнений</span>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
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
