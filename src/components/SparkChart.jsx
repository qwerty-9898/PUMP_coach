export default function SparkChart({ data, color = '#ff5a1f', height = 120, unit = '' }) {
  if (!data || data.length === 0) return <div className="chart-empty">Нет данных</div>
  const w = 300, h = height, pad = 14
  const max = Math.max(...data), min = Math.min(...data)
  const range = (max - min) || 1
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0
  const pts = data.map((v, i) => {
    const x = data.length > 1 ? pad + i * stepX : w / 2
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return [x, y]
  })
  const uid = 'sg' + Math.random().toString(36).slice(2, 7)
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const area = line + ' L ' + pts[pts.length - 1][0].toFixed(1) + ' ' + (h - pad) + ' L ' + pts[0][0].toFixed(1) + ' ' + (h - pad) + ' Z'
  const lastPt = pts[pts.length - 1]
  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} width="100%" height={height} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {data.length > 1 && <path d={area} fill={'url(#' + uid + ')'} />}
      {data.length > 1 && <path d={line} fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4.5" fill={color} />
      <text x={Math.min(lastPt[0], w - 30)} y={Math.max(lastPt[1] - 8, 14)} fill={color} fontSize="14" fontFamily="Oswald, sans-serif" fontWeight="700" textAnchor="middle">{data[data.length - 1]}{unit}</text>
    </svg>
  )
}
