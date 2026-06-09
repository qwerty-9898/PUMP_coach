// Тонкие линейные иконки. Значение — строка (один path) или массив строк (несколько path).
const P = {
  home: ['M4 11l8-7 8 7', 'M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9'],
  grid: 'M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  chevronR: 'M9 6l6 6-6 6',
  clock: 'M12 8v5l3 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  dumbbell: 'M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11',
  flame: 'M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.4-2 1-2.8C9.6 9.6 11 8 12 3Z',
  book: 'M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4ZM18 16H7a2 2 0 0 0-2 2',
  activity: 'M3 12h4l3 7 4-14 3 7h4',
  droplet: 'M12 3.5c3 4 5.5 6.3 5.5 9.5a5.5 5.5 0 0 1-11 0c0-3.2 2.5-5.5 5.5-9.5Z',
  ruler: 'M4 8l8-4 8 4-8 12-8-12ZM9 7l1 2M13 5.5l1 2M12 10l1 2',
  timer: 'M12 8v5l3 2M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9 2h6',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 12h.01',
  bolt: 'M13 3 4 14h7l-1 7 9-11h-7l1-7Z',
  chevron: 'M6 9l6 6 6-6',
  check: 'M5 12l5 5 9-11',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  x: 'M6 6l12 12M18 6 6 18',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  back: 'M19 12H5M11 6l-6 6 6 6',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01',
  play: 'M7 5l11 7-11 7V5Z',
  pause: 'M8 5v14M16 5v14',
  refresh: 'M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M18 4v5h-5M6 20v-5h5',
  trophy: 'M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 16h6M8 20h8M12 16v4',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM21 21l-5-5',
  trash: 'M5 7h14M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  star: 'M12 4l2.4 5 5.6.8-4 4 1 5.6L12 22l-5-2.6 1-5.6-4-4 5.6-.8L12 4Z',
  calc: 'M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
  apple: 'M12 8c-2-3-7-2-7 3 0 4 3 8 5 8 1 0 1-.5 2-.5s1 .5 2 .5c2 0 5-4 5-8 0-5-5-6-7-3ZM12 8V5a2 2 0 0 1 2-2',
  plate: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  // Анатомичные иконки групп мышц
  m_chest: ['M5 7h14v4a7 7 0 0 1-14 0V7Z', 'M12 7v9', 'M5 7c2-1.5 5-1.5 7 0 2-1.5 5-1.5 7 0'],
  m_back: ['M12 4c-4 0-7 2.5-7 6.5L9 14a4 4 0 0 0 6 0l4-3.5C19 6.5 16 4 12 4Z', 'M12 4v11'],
  m_legs: ['M9 4h6', 'M10.5 4l-1 8-1 8h2l1-8', 'M13.5 4l1 8 1 8h-2l-1-8'],
  m_shoulders: ['M3 13a9 7 0 0 1 18 0', 'M7.5 13a4.5 3.5 0 0 1 9 0', 'M12 4v3'],
  m_biceps: ['M6 19v-7a4 4 0 0 1 8 0c3 0 4 2 4 4', 'M10 12a3 3 0 0 0 0 5'],
  m_triceps: ['M6 5v7a4 4 0 0 0 8 0c3 0 4-2 4-4', 'M10 12a3 3 0 0 1 0-5'],
  m_abs: ['M7 4h10v16H7zM7 9h10M7 14h10M12 4v16']
}

export default function Icon({ name, size = 22, stroke = 1.8, className = '', style }) {
  const d = P[name]
  if (!d) return null
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true">
      {paths.map((pd, i) => <path key={i} d={pd} />)}
    </svg>
  )
}
