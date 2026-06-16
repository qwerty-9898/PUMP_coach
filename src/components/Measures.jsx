import { useState } from 'react'
import Icon from './Icon.jsx'
import { store, todayKey } from '../storage.js'

const FIELDS = [
  { k: 'weight', label: 'Вес, кг' },
  { k: 'chest', label: 'Грудь, см' },
  { k: 'waist', label: 'Талия, см' },
  { k: 'hip', label: 'Бёдра, см' },
  { k: 'biceps', label: 'Бицепс, см' }
]

export default function Measures() {
  const [list, setList] = useState(() => store.getMeasures())
  const [f, setF] = useState({})
  const [photos, setPhotos] = useState(() => store.getPhotos())
  const [view, setView] = useState(null)

  function save() {
    const entry = { date: todayKey() }
    let any = false
    for (const fl of FIELDS) { if (f[fl.k]) { entry[fl.k] = Number(f[fl.k]); any = true } }
    if (!any) return
    const next = [...list, entry]
    setList(next); store.setMeasures(next); setF({})
  }

  function onPhoto(e) {
    const file = e.target.files && e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const max = 540
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h
        cv.getContext('2d').drawImage(img, 0, 0, w, h)
        try { setPhotos(store.addPhoto(cv.toDataURL('image/jpeg', 0.72))) } catch (err) { window.alert('Не удалось сохранить фото — закончилось место.') }
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  function delPhoto(id) { setPhotos(store.removePhoto(id)) }

  const last = list[list.length - 1]
  const prev = list[list.length - 2]
  const oldest = photos[photos.length - 1], newest = photos[0]

  return (
    <div className="screen">
      <div className="block-head"><h2 className="display sm">Новый замер</h2></div>
      <div className="measgrid">
        {FIELDS.map(fl => (
          <label className="field" key={fl.k}>
            <span className="flabel">{fl.label}</span>
            <input type="number" inputMode="decimal" value={f[fl.k] || ''} placeholder="—"
              onChange={e => setF(p => ({ ...p, [fl.k]: e.target.value }))} />
          </label>
        ))}
      </div>
      <button className="cta" onClick={save}><Icon name="check" size={18} /> Сохранить замер</button>

      {last && (
        <>
          <div className="block-head" style={{ marginTop: 22 }}><h2 className="display sm">Последний замер</h2></div>
          <div className="measlast">
            {FIELDS.filter(fl => last[fl.k] != null).map(fl => {
              const diff = prev && prev[fl.k] != null ? (last[fl.k] - prev[fl.k]) : null
              return (
                <div className="measrow" key={fl.k}>
                  <span>{fl.label}</span>
                  <b>{last[fl.k]}</b>
                  {diff != null && diff !== 0 && (
                    <span className={'measdiff ' + (diff > 0 ? 'up' : 'down')}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</span>
                  )}
                </div>
              )
            })}
            <span className="meas-date">{fmt(last.date)}</span>
          </div>
        </>
      )}

      {/* Прогресс-фото */}
      <div className="block-head" style={{ marginTop: 24 }}><h2 className="display sm">Прогресс-фото</h2></div>
      {photos.length >= 2 && (
        <div className="ba">
          <div className="ba-col"><img src={oldest.url} alt="до" onClick={() => setView(oldest.url)} /><span>До · {fmt(oldest.date)}</span></div>
          <div className="ba-col"><img src={newest.url} alt="сейчас" onClick={() => setView(newest.url)} /><span>Сейчас · {fmt(newest.date)}</span></div>
        </div>
      )}
      <label className="cta ghost-cta photo-add">
        <Icon name="plus" size={18} /> Добавить фото
        <input type="file" accept="image/*" onChange={onPhoto} hidden />
      </label>
      {photos.length > 0 && (
        <div className="photogrid">
          {photos.map(p => (
            <div className="photo" key={p.id}>
              <img src={p.url} alt="" onClick={() => setView(p.url)} />
              <button className="photo-del" onClick={() => delPhoto(p.id)} aria-label="Удалить"><Icon name="x" size={13} /></button>
              <span className="photo-date">{fmt(p.date)}</span>
            </div>
          ))}
        </div>
      )}
      {photos.length === 0 && !last && (
        <div className="empty" style={{ marginTop: 14 }}>
          <Icon name="ruler" size={30} />
          <p>Записывай замеры и делай фото раз в 1–2 недели в одном свете — увидишь реальную динамику.</p>
        </div>
      )}

      {view && (
        <div className="sheet sheet-center" onClick={() => setView(null)}>
          <img className="photo-full" src={view} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function fmt(s) { return new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) }
