const DAY_MS = 24 * 60 * 60 * 1000

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** « 18:05 » aujourd'hui, « Hier », « Lun. » dans la semaine, sinon « 12 oct. ». */
export function formatMessageTime(iso: string, now = new Date()) {
  const date = new Date(iso)
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)

  if (days <= 0) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Hier'
  if (days < 7) return capitalize(date.toLocaleDateString('fr-FR', { weekday: 'short' }))
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
