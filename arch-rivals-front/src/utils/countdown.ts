import type { NextMatch } from './bracket'

/** Au-delà, on affiche simplement l'horaire prévu. */
const COUNTDOWN_MAX_MINUTES = 24 * 60

/** « En cours », « Dans 2 h 05 », « Imminent », ou '' si le match est trop loin / sans date. */
export function countdownLabel(match: NextMatch, now: number): string {
  if (match.live) return 'En cours'
  if (!match.startsAt) return ''

  const minutes = Math.round((Date.parse(match.startsAt) - now) / 60_000)
  if (Number.isNaN(minutes) || minutes > COUNTDOWN_MAX_MINUTES) return ''
  if (minutes <= 0) return 'Imminent'
  return `Dans ${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`
}
