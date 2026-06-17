// Vercel serverless: распознаёт еду на фото и оценивает КБЖУ.
// БЕСПЛАТНО: добавь GEMINI_API_KEY (Google AI Studio, бесплатный тариф) в Environment Variables Vercel.
// Альтернатива (платно): OPENAI_API_KEY. Ключи хранятся на сервере, в браузер не попадают.
const PROMPT = 'Ты нутрициолог. На фото — приём пищи. Определи блюда/продукты и оцени их вес и КБЖУ. ' +
  'Верни СТРОГО JSON без пояснений: {"items":[{"name":"строка по-русски","grams":число,"kcal":число,"p":число,"f":число,"c":число}]}. ' +
  'Числа целые, на фактическую порцию (не на 100 г). Если еды не видно — {"items":[]}.'

function normItems(parsed) {
  const arr = parsed && Array.isArray(parsed.items) ? parsed.items : []
  return arr.map(it => ({
    name: String(it.name || 'Блюдо').slice(0, 60),
    grams: Math.max(0, Math.round(Number(it.grams) || 0)),
    kcal: Math.max(0, Math.round(Number(it.kcal) || 0)),
    p: Math.max(0, Math.round(Number(it.p) || 0)),
    f: Math.max(0, Math.round(Number(it.f) || 0)),
    c: Math.max(0, Math.round(Number(it.c) || 0))
  })).filter(it => it.kcal > 0)
}

async function viaGemini(key, mime, b64) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: b64 } }] }],
      generationConfig: { response_mime_type: 'application/json', temperature: 0.2 }
    })
  })
  if (!r.ok) return { error: 'ai', message: (await r.text()).slice(0, 200) }
  const j = await r.json()
  const txt = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text
  let parsed = {}; try { parsed = JSON.parse(txt) } catch (e) {}
  return { items: normItems(parsed) }
}

async function viaOpenAI(key, dataUrl) {
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: 'gpt-4o-mini', max_tokens: 700, response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [{ type: 'text', text: PROMPT }, { type: 'image_url', image_url: { url: dataUrl } }] }]
    })
  })
  if (!r.ok) return { error: 'ai', message: (await r.text()).slice(0, 200) }
  const j = await r.json()
  const txt = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content
  let parsed = {}; try { parsed = JSON.parse(txt) } catch (e) {}
  return { items: normItems(parsed) }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return }
  const gem = process.env.GEMINI_API_KEY
  const oai = process.env.OPENAI_API_KEY
  if (!gem && !oai) { res.status(503).json({ error: 'no_key', message: 'ИИ-ключ не настроен. Добавь GEMINI_API_KEY (бесплатно) в настройках Vercel.' }); return }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch (e) { body = {} } }
  const image = body && body.image
  if (!image || typeof image !== 'string') { res.status(400).json({ error: 'no_image' }); return }

  const mimeMatch = image.match(/^data:([^;]+);base64,/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const b64 = image.indexOf(',') >= 0 ? image.slice(image.indexOf(',') + 1) : image

  try {
    const out = gem ? await viaGemini(gem, mime, b64) : await viaOpenAI(oai, image)
    if (out.error) { res.status(502).json(out); return }
    res.status(200).json({ items: out.items })
  } catch (e) {
    res.status(500).json({ error: 'server', message: String(e).slice(0, 200) })
  }
}
