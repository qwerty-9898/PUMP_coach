// Интеграция с Telegram Mini App. Всё безопасно: если открыто не в Telegram — просто ничего не делает.
const wa = (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null

export function isTelegram() {
  return !!(wa && wa.platform && wa.platform !== 'unknown')
}

export function initTelegram() {
  if (!wa) return
  try {
    wa.ready()
    wa.expand()
    if (wa.setHeaderColor) wa.setHeaderColor('#05060a')
    if (wa.setBackgroundColor) wa.setBackgroundColor('#05060a')
    if (wa.enableClosingConfirmation) wa.enableClosingConfirmation()
  } catch (e) {}
}

export function tgBackButton(show, handler) {
  if (!wa || !wa.BackButton) return () => {}
  try {
    if (show) { wa.BackButton.show(); wa.BackButton.onClick(handler) }
    else { wa.BackButton.hide() }
  } catch (e) {}
  return () => { try { wa.BackButton.offClick(handler) } catch (e) {} }
}

export function haptic(type) {
  try { if (wa && wa.HapticFeedback) wa.HapticFeedback.impactOccurred(type || 'light') } catch (e) {}
}

export function tgUserName() {
  try {
    const u = wa && wa.initDataUnsafe && wa.initDataUnsafe.user
    return u ? u.first_name : null
  } catch (e) { return null }
}

const BOT_URL = 'https://t.me/pump_coach_bot' // замени на адрес своего бота

export function openLink(url) {
  try { if (wa && wa.openLink) { wa.openLink(url, { try_instant_view: false }); return } } catch (e) {}
  try { window.open(url, '_blank') } catch (e) {}
}

export function shareText(text) {
  const url = 'https://t.me/share/url?url=' + encodeURIComponent(BOT_URL) + '&text=' + encodeURIComponent(text)
  try { if (wa && wa.openTelegramLink) { wa.openTelegramLink(url); return } } catch (e) {}
  try { window.open(url, '_blank') } catch (e) {}
}
