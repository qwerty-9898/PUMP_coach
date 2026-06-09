// Утилиты локального хранилища
const K = {
  profile: 'pump_profile_v3',
  progress: 'pump_progress_v1',
  water: 'pump_water_v1',
  measures: 'pump_measures_v1',
  food: 'pump_food_v1',
  fav: 'pump_fav_v1',
  favex: 'pump_favex_v1',
  rating: 'pump_rating_v1',
  logs: 'pump_logs_v1'
}

function read(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback }
  catch (e) { return fallback }
}
function write(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch (e) {}
}

export const store = {
  getProfile: () => read(K.profile, null),
  setProfile: (p) => write(K.profile, p),
  clearProfile: () => { try { localStorage.removeItem(K.profile) } catch (e) {} },
  clearAll: () => { try { Object.keys(localStorage).filter(k => k.startsWith('pump_')).forEach(k => localStorage.removeItem(k)) } catch (e) {} },

  getProgress: () => read(K.progress, { workouts: [] }),
  setProgress: (p) => write(K.progress, p),

  getWater: () => read(K.water, {}),
  setWater: (w) => write(K.water, w),

  getMeasures: () => read(K.measures, []),
  setMeasures: (m) => write(K.measures, m),

  // Дневник еды: { 'YYYY-MM-DD': [ {uid,name,grams,meal,kcal,p,f,c} ] }
  getFoodDay: (date) => read(K.food, {})[date] || [],
  addFood: (date, entry) => {
    const all = read(K.food, {})
    all[date] = all[date] || []
    all[date].push({ ...entry, uid: Date.now() + '' + Math.floor(Math.random() * 1000) })
    write(K.food, all)
  },
  removeFood: (date, uid) => {
    const all = read(K.food, {})
    all[date] = (all[date] || []).filter(e => e.uid !== uid)
    write(K.food, all)
  },

  getFavorites: () => read(K.fav, []),
  toggleFavorite: (foodId) => {
    let fav = read(K.fav, [])
    fav = fav.includes(foodId) ? fav.filter(x => x !== foodId) : [...fav, foodId]
    write(K.fav, fav)
    return fav
  }  ,
  getFavEx: () => read(K.favex, []),
  toggleFavEx: (id) => {
    let f = read(K.favex, [])
    f = f.includes(id) ? f.filter(x => x !== id) : [...f, id]
    write(K.favex, f); return f
  },
  getRating: () => read(K.rating, {}),
  setRating: (pid, stars) => { const r = read(K.rating, {}); r[pid] = stars; write(K.rating, r) }  ,
  getLogs: () => read(K.logs, []),
  addLog: (entry) => { const a = read(K.logs, []); a.push(entry); write(K.logs, a) },
  getExLogs: (exId) => read(K.logs, []).filter(e => e.exId === exId).sort((a, b) => a.date.localeCompare(b.date)),
  getLastSets: (exId) => { const l = read(K.logs, []).filter(e => e.exId === exId); return l.length ? l[l.length - 1].sets : null },
  loggedExIds: () => [...new Set(read(K.logs, []).map(e => e.exId))]

}

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10)
}

export function calcStreak(dates) {
  if (!dates.length) return 0
  const set = new Set(dates)
  let streak = 0
  const d = new Date()
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1)
  while (set.has(todayKey(d))) { streak++; d.setDate(d.getDate() - 1) }
  return streak
}
