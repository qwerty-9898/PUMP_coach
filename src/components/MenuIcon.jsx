// Кастомные duotone-иконки: мягкая заливка + чёткий контур, цвет через currentColor.
const ICONS = {
  nutrition: { d: 'M12 2.6c2.2 3.7 4.6 5 4.6 8.9a4.6 4.6 0 1 1-9.2 0c0-1.5.5-2.6 1.3-3.5C10 11 11.2 8.8 12 2.6Z',
    lines: ['M12 21c-2 0-3.4-1.4-3.4-3.2 0-1.5 1.4-2.4 1.8-3.6.5 1.2 1.4 1.6 1.6 2.8'] },
  water: { d: 'M12 3.2c3 4 5.2 6.3 5.2 9.4a5.2 5.2 0 1 1-10.4 0C6.8 9.5 9 7.2 12 3.2Z',
    lines: ['M9 13.5c0 1.8 1.3 3.2 3 3.4'] },
  measures: { d: 'M4.2 9.2 9.2 4.2 19.8 14.8 14.8 19.8Z',
    lines: ['M11 6.4 12.6 8', 'M8.6 8.8 10.2 10.4', 'M13.4 11.2 15 12.8', 'M6.2 11.2 7.8 12.8'] },
  timer: { d: 'M12 7.2a6.6 6.6 0 1 1 0 13.2 6.6 6.6 0 0 1 0-13.2Z',
    lines: ['M10 4.4H14', 'M12 13.8V10', 'M12 13.8 15 13.8', 'M18.5 7 20 5.5'] },
  calculators: { d: 'M6.5 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
    lines: ['M8 7.2H16', 'M8.4 11.2H10', 'M11.6 11.2H13.2', 'M8.4 14.6H10', 'M11.6 14.6H13.2', 'M14.8 11.2v3.4'] },
  catalog: { d: 'M6 3.5h7a3 3 0 0 1 3 3V20.5H9a3 3 0 0 1-3-3Z',
    lines: ['M9 8H13', 'M9 11H12.4', 'M16 6.5h2.2v12a1.6 1.6 0 0 0-1.6-1.6H9'] },
  reload: { lines: ['M19.5 12a7.5 7.5 0 1 1-2.2-5.3', 'M17.6 3.5V7.2H13.9'] },
  trash: { d: 'M6.5 7.5h11l-1 12.2a2 2 0 0 1-2 1.8H9.5a2 2 0 0 1-2-1.8Z',
    lines: ['M4.5 7.5H19.5', 'M9.5 7.5V5.4a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7.5', 'M10.2 11.5V17.5', 'M13.8 11.5V17.5'] },
  user: { d: 'M12 4.2a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Z',
    lines: ['M5.6 20a6.4 6.4 0 0 1 12.8 0'] }
}

export default function MenuIcon({ name, size = 24 }) {
  const ic = ICONS[name]
  if (!ic) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {ic.d && <path d={ic.d} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />}
      {(ic.lines || []).map((l, i) => (
        <path key={i} d={l} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  )
}
