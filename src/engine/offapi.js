// Open Food Facts — бесплатный публичный API (CORS разрешён). Поиск еды и продукт по штрихкоду.
const BASE = 'https://world.openfoodfacts.org'

function num(n) { const x = Number(n); return isFinite(x) ? x : 0 }

function mapProduct(p, code) {
  if (!p) return null
  const nu = p.nutriments || {}
  // калории: пробуем 100г, потом порцию, потом перевод из кДж
  let kcal = num(nu['energy-kcal_100g']) || num(nu['energy-kcal_serving']) || num(nu['energy-kcal_value'])
  if (!kcal) {
    const kj = num(nu['energy_100g']) || num(nu['energy-kj_100g']) || num(nu['energy_value'])
    if (kj) kcal = Math.round(kj / 4.184)
  }
  const prot = num(nu.proteins_100g) || num(nu.proteins_serving)
  const fat = num(nu.fat_100g) || num(nu.fat_serving)
  const carb = num(nu.carbohydrates_100g) || num(nu.carbohydrates_serving)
  let name = (p.product_name_ru || p.product_name || p.generic_name || '').trim()
  const brand = p.brands ? String(p.brands).split(',')[0].trim() : ''
  if (!name) name = brand || ('Товар ' + (code || ''))
  else if (brand && !name.toLowerCase().includes(brand.toLowerCase())) name = name + ' · ' + brand
  return {
    id: 'off_' + (code || p.code || name),
    name,
    kcal: Math.round(kcal),
    p: Math.round(prot),
    f: Math.round(fat),
    c: Math.round(carb),
    portion: 100,
    off: true,
    hasMacros: kcal > 0
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

// Продукт по штрихкоду (EAN/UPC) → продукт (даже без КБЖУ) или null, если не найден.
export async function productByBarcode(code) {
  const c = String(code || '').replace(/\D/g, '')
  if (c.length < 6) return null
  const url = BASE + '/api/v2/product/' + c + '.json?fields=code,product_name,product_name_ru,generic_name,brands,nutriments'
  const j = await getJSON(url)
  if (!j || j.status !== 1 || !j.product) return null
  return mapProduct(j.product, c)
}
