// Open Food Facts — бесплатный публичный API (CORS разрешён). Поиск еды и продукт по штрихкоду.
// Работает из браузера/Telegram; в песочнице сеть к OFF может быть закрыта — это нормально.
const BASE = 'https://world.openfoodfacts.org'

function num(n) { const x = Number(n); return isFinite(x) ? x : 0 }

function mapProduct(p, code) {
  if (!p) return null
  const nu = p.nutriments || {}
  let kcal = num(nu['energy-kcal_100g'])
  if (!kcal && nu['energy_100g']) kcal = Math.round(num(nu['energy_100g']) / 4.184)
  let name = (p.product_name_ru || p.product_name || p.generic_name || '').trim()
  if (!name) return null
  const brand = p.brands ? String(p.brands).split(',')[0].trim() : ''
  if (brand && !name.toLowerCase().includes(brand.toLowerCase())) name = name + ' · ' + brand
  return {
    id: 'off_' + (code || p.code || name),
    name,
    kcal: Math.round(kcal),
    p: Math.round(num(nu.proteins_100g)),
    f: Math.round(num(nu.fat_100g)),
    c: Math.round(num(nu.carbohydrates_100g)),
    portion: 100,
    off: true
  }
}

async function getJSON(url, ms = 9000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!r.ok) return null
    return await r.json()
  } catch (e) { return null }
  finally { clearTimeout(t) }
}

// Текстовый поиск по базе OFF → массив продуктов в нашем формате.
export async function searchOFF(query) {
  const q = (query || '').trim()
  if (q.length < 2) return []
  const url = BASE + '/cgi/search.pl?search_terms=' + encodeURIComponent(q) +
    '&search_simple=1&action=process&json=1&page_size=25&fields=code,product_name,product_name_ru,generic_name,brands,nutriments'
  const j = await getJSON(url)
  const arr = (j && j.products) || []
  const out = [], seen = new Set()
  for (const p of arr) {
    const m = mapProduct(p, p.code)
    if (m && m.kcal > 0) { const key = m.name.toLowerCase(); if (!seen.has(key)) { seen.add(key); out.push(m) } }
  }
  return out.slice(0, 30)
}

// Продукт по штрихкоду (EAN/UPC) → один продукт или null.
export async function productByBarcode(code) {
  const c = String(code || '').replace(/\D/g, '')
  if (c.length < 6) return null
  const url = BASE + '/api/v2/product/' + c + '.json?fields=code,product_name,product_name_ru,generic_name,brands,nutriments'
  const j = await getJSON(url)
  if (!j || j.status !== 1) return null
  return mapProduct(j.product, c)
}
