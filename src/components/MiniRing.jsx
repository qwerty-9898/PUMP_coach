// Маленькое кольцо прогресса для сетки (восстановление / покрытие).
const R = 20, C = 2 * Math.PI * R

export default function MiniRing({ pct = 0, color = '#ff5a1f', center, label, sub, dim = false, onClick }) {
  const off = C * (1 - Math.max(0, Math.min(1, pct)))
  const inner = (
    <>
      <span className="mring-c">
        <svg viewBox="0 0 52 52">
          <circle cx="26" cy="26" r={R} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="5" />
          <circle cx="26" cy="26" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 26 26)" opacity={dim ? 0.4 : 1} />
        </svg>
        <span className="mring-v" style={{ opacity: dim ? 0.5 : 1 }}>{center}</span>
      </span>
      <span className="mring-l">{label}</span>
      {sub && <span className="mring-sub">{sub}</span>}
    </>
  )
  return onClick
    ? <button className="mring" onClick={onClick}>{inner}</button>
    : <div className="mring">{inner}</div>
}
