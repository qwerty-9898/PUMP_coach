// Vercel serverless-функция: распознаёт еду на фото и оценивает КБЖУ.
// Ключ ИИ-сервиса хранится в переменной окружения Vercel (OPENAI_API_KEY) — в браузер не попадает.
// Настройка: Vercel → Project → Settings → Environment Variables → OPENAI_API_KEY = sk-...
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return }
  const key = process.env.OPENAI_API_KEY
  if (!key) { res.status(503).json({ error: 'no_key', message: 'ИИ-ключ не настроен. Добавь OPENAI_API_KEY в настройках Vercel.' }); return }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch (e) { body = {} } }
  const image = body && body.image
  if (!image || typeof image !== 'string') { res.status(400).json({ error: 'no_image' }); return }

  const prompt = 'Ты нутрициолог. На фото — приём пищи. Определи блюда/продукты и оцени их вес и КБЖУ. ' +
    'Верни СТРОГО JSON без пояснений в формате: {"items":[{"name":"строка по-русски","grams":число,"kcal":число,"p":число,"f":число,"c":число}]}. ' +
    'Числа целые, на фактическую порцию (не на 100 г). Если еды не видно — верни {"items":[]}.'

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 700,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: image } }
          ]
        }]
      })
    })
    if (!r.ok) {
      const t = await r.text()
      res.status(502).json({ error: 'ai', message: t.slice(0, 200) }); return
    }
    const j = await r.json()
    const txt = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content
    let parsed = {}
    try { parsed = JSON.parse(txt) } catch (e) { parsed = {} }
    const items = Array.isArray(parsed.items) ? parsed.items.map(it => ({
      name: String(it.name || 'Блюдо').slice(0, 60),
      grams: Math.max(0, Math.round(Number(it.grams) || 0)),
      kcal: Math.max(0, Math.round(Number(it.kcal) || 0)),
      p: Math.max(0, Math.round(Number(it.p) || 0)),
      f: Math.max(0, Math.round(Number(it.f) || 0)),
      c: Math.max(0, Math.round(Number(it.c) || 0))
    })).filter(it => it.kcal > 0) : []
    res.status(200).json({ items })
  } catch (e) {
    res.status(500).json({ error: 'server', message: String(e).slice(0, 200) })
  }
}
