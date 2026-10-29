// Libellés des dates prévues (indicatives) : clôture des inscriptions et horaire des matchs.
// Le back renvoie des dates ISO 8601 en UTC ; elles s'affichent à l'heure du navigateur.

const DAY_MS = 24 * 60 * 60 * 1000
const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** « 30 oct. », « 1er déc. », avec l'année si elle n'est pas l'année en cours. */
export function shortDate(iso: string) {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date
    .toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      ...(!sameYear && { year: 'numeric' }),
    })
    .replace(/^1 /, '1er ')
}

/** Termine une phrase par une date sans doubler le point de « déc. ». */
export const endWithDate = (iso: string) => {
  const date = shortDate(iso)
  return date.endsWith('.') ? date : `${date}.`
}

/** « 21h00 » */
const hour = (date: Date) =>
  date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h')

/** « Aujourd'hui · 21h00 », « Demain · 19h00 », sinon « Sam. 25 oct. · 20h00 ». */
export function matchTimeLabel(iso: string, now = new Date()) {
  const date = new Date(iso)
  const days = Math.round((startOfDay(date) - startOfDay(now)) / DAY_MS)
  const day =
    days === 0
      ? 'Aujourd’hui'
      : days === 1
        ? 'Demain'
        : capitalize(
            date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
          )
  return `${day} · ${hour(date)}`
}

/** « Dans 2 h 05 » dans les 24 h, « Imminent » une fois l'heure passée, sinon null. */
export function countdownLabel(iso: string, now = new Date()) {
  const minutes = Math.round((new Date(iso).getTime() - now.getTime()) / 60_000)
  if (minutes <= 0) return 'Imminent'
  if (minutes >= 24 * 60) return null
  return `Dans ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
}

/** « Clôture le 30 oct. » (date prévue, indicative). */
export const closingLabel = (iso: string) => `Clôture le ${shortDate(iso)}`
