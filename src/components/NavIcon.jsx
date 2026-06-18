// Иконки нижней навигации: контур в покое, заливка при активной вкладке.
const ICONS = {
  home: 'M4 11.4 12 4.2l8 7.2V19.5a1.2 1.2 0 0 1-1.2 1.2H15v-5.6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1V20.7H5.2A1.2 1.2 0 0 1 4 19.5Z',
  workout: 'M2.6 9.8h2.1v4.4H2.6zM5.2 8.1h2.2v7.8H5.2zM16.6 8.1h2.2v7.8h-2.2zM19.3 9.8h2.1v4.4h-2.1zM7.8 10.9h8.4v2.2H7.8z',
  catalog: 'M4.5 5h15v3.4h-15zM4.5 10.3h15v3.4h-15zM4.5 15.6h15V19h-15z',
  progress: 'M4.6 13h3.1v6H4.6zM10.4 8.6h3.1V19h-3.1zM16.3 4.8h3.1V19h-3.1z',
  nutrition: 'M12 8.4c-1.7-2.5-6.2-1.6-6.2 2.5 0 3.5 2.6 7.1 4.4 7.1.9 0 1-.5 1.8-.5s.9.5 1.8.5c1.8 0 4.4-3.6 4.4-7.1 0-4.1-4.5-5-6.2-2.5ZM12 8.4V5.4a1.8 1.8 0 0 1 1.8-1.8',
  more: 'M12 4.4a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8ZM5.6 19.4a6.4 6.4 0 0 1 12.8 0Z'
}

export default function NavIcon({ name, size = 24, active = false }) {
  const d = ICONS[name]
  if (!d) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d}
        fill={active ? 'currentColor' : 'none'}
        fillOpacity={active ? 0.95 : 0}
        stroke="currentColor"
        strokeWidth={active ? 1.3 : 1.7}
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
