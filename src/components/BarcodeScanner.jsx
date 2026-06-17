import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

// Live-сканер EAN/штрихкодов через камеру (ZXing). Динамический импорт, чтобы не раздувать бандл.
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let stopped = false
    ;(async () => {
      try {
        const mod = await import('@zxing/browser')
        const Reader = mod.BrowserMultiFormatReader
        const reader = new Reader()
        controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current, (result, e, controls) => {
          if (result && !stopped) {
            stopped = true
            try { controls.stop() } catch (_) {}
            onDetected(result.getText())
          }
        })
      } catch (e) {
        setErr('Не удалось открыть камеру. Введи штрихкод вручную ниже.')
      }
    })()
    return () => {
      stopped = true
      try { controlsRef.current && controlsRef.current.stop() } catch (_) {}
      try {
        const v = videoRef.current
        if (v && v.srcObject) v.srcObject.getTracks().forEach(t => t.stop())
      } catch (_) {}
    }
  }, [])

  return (
    <div className="scanner">
      <video ref={videoRef} className="scanner-video" muted playsInline autoPlay />
      <div className="scanner-overlay">
        <div className="scanner-frame" />
        <span className="scanner-hint">Наведи рамку на штрихкод продукта</span>
      </div>
      <button className="scanner-close" onClick={onClose} aria-label="Закрыть"><Icon name="x" size={22} /></button>
      {err && <div className="scanner-err">{err}</div>}
    </div>
  )
}
