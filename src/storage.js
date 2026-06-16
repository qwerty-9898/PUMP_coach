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
  logs: 'pump_logs_v1',
  freq: 'pump_foodfreq_v1',
  dishes: 'pump_dishes_v1',
  kcalgoal: 'pump_kcalgoal_v1',
  active: 'pump_active_v1',
  fast: 'pump_fast_v1',
  routines: 'pump_routines_v1',
  photos: 'pump_photos_v1'
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

  // Дневник еды: { 'YYYY-MM-DD': [ {uid,name,grams,meal,kcal,p,f,c,foodId} ] }
  getFoodDay: (date) => read(K.food, {})[date] || [],
  addFood: (date, entry) => {
    const all = read(K.food, {})
    all[date] = all[date] || []
    all[date].push({ ...entry, uid: Date.now() + '' + Math.floor(Math.random() * 1000) })
    write(K.food, all)
    if (entry.foodId) { const m = read(K.freq, {}); m[entry.foodId] = (m[entry.foodId] || 0) + 1; write(K.freq, m) }
  },
  removeFood: (date, uid) => {
    const all = read(K.food, {})
    all[date] = (all[date] || []).filter(e => e.uid !== uid)
    write(K.food, all)
  },
  updateFood: (date, uid, patch) => {
    const all = read(K.food, {})
    all[date] = (all[date] || []).map(e => e.uid === uid ? { ...e, ...patch } : e)
    write(K.food, all)
  },
  frequentFoods: (limit = 12) => {
    const m = read(K.freq, {})
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id)
  },
  foodWeek: (days = 7) => {
    const all = read(K.food, {}); const out = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); const key = todayKey(d)
      out.push({ date: key, kcal: (all[key] || []).reduce((a, e) => a + e.kcal, 0) })
    }
    return out
  },
  getDishes: () => read(K.dishes, []),
  addDish: (dish) => { const a = read(K.dishes, []); a.push({ ...dish, id: 'd' + Date.now() }); write(K.dishes, a); return a },
  removeDish: (id) => { const a = read(K.dishes, []).filter(d => d.id !== id); write(K.dishes, a); return a },
  getKcalGoal: () => read(K.kcalgoal, null),
  setKcalGoal: (n) => write(K.kcalgoal, n),
  getActiveProgram: () => read(K.active, null),
  setActiveProgram: (id) => write(K.active, id),
  getFast: () => read(K.fast, null),
  setFast: (f) => write(K.fast, f),
  getRoutines: () => read(K.routines, []),
  addRoutine: (r) => { const a = read(K.routines, []); a.unshift({ ...r, id: 'r' + Date.now() }); write(K.routines, a); return a },
  removeRoutine: (id) => { const a = read(K.routines, []).filter(x => x.id !== id); write(K.routines, a); return a },
  getPhotos: () => read(K.photos, []),
  addPhoto: (dataUrl) => { const a = read(K.photos, []); a.unshift({ id: 'ph' + Date.now(), date: todayKey(), url: dataUrl }); const cut = a.slice(0, 12); write(K.photos, cut); return cut },
  removePhoto: (id) => { const a = read(K.photos, []).filter(x => x.id !== id); write(K.photos, a); return a },

  getFavorites: () => read(K.fav, []),
  toggleFavorite: (foodId) => {
    let fav = read(K.fav, [])
    fav = fav.includes(foodId) ? fav.filter(x => x !== foodId) : [...fav, foodId]
    write(K.fav, fav)
    return fav
  },
  getFavEx: () => read(K.favex, []),
  toggleFavEx: (id) => {
    let f = read(K.favex, [])
    f = f.includes(id) ? f.filter(x => x !== id) : [...f, id]
    write(K.favex, f); return f
  },
  getRating: () => read(K.rating, {}),
  setRating: (pid, stars) => { const r = read(K.rating, {}); r[pid] = stars; write(K.rating, r) },
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

export function calcWeekStreak(dates) {
  if (!dates.length) return 0
  const weeks = new Set(dates.map(d => weekKey(d)))
  let streak = 0
  let cur = new Date()
  if (!weeks.has(weekKey(cur))) cur.setDate(cur.getDate() - 7)
  while (weeks.has(weekKey(cur))) { streak++; cur.setDate(cur.getDate() - 7) }
  return streak
}
function weekKey(d) {
  const x = new Date(d); const day = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - day)
  return x.toISOString().slice(0, 10)
}
