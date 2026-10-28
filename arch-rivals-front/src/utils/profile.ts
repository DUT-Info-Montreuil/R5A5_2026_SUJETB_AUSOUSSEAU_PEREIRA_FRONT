import type { Tournament } from '../types/tournament'
import { playerProgress } from './bracket'
import { findMyTeam } from './tournaments'

export type ProfileStats = {
  /** Tournois où le joueur a porté une bannière. */
  tournaments: number
  /** Part des matchs joués gagnés (en %), null si aucun match joué. */
  winRate: number | null
  titles: number
}

export type FeatTone = 'gold' | 'silver' | 'bronze' | 'muted'

export type FeatOfArms = {
  tournamentId: number
  name: string
  result: string
  tone: FeatTone
}

/** Faits d'armes affichés sur le profil. */
export const FEATS_SHOWN = 5

/**
 * Statistiques tirées des arbres des tournois : le back n'a pas (encore) de route dédiée.
 * Un forfait compte comme un match joué.
 */
export function profileStats(
  tournaments: readonly Tournament[],
  userId: number | null,
): ProfileStats {
  let played = 0
  let won = 0
  let count = 0
  let titles = 0

  for (const tournament of tournaments) {
    const mine = findMyTeam(tournament, userId)
    if (!mine) continue
    count++
    for (const match of tournament.matches) {
      if (match.status !== 'finished') continue
      if (match.teamAId !== mine.id && match.teamBId !== mine.id) continue
      played++
      if (match.winnerId === mine.id) won++
    }
    if (tournament.state === 'termine' && playerProgress(tournament, userId).kind === 'champion')
      titles++
  }

  return {
    tournaments: count,
    winRate: played ? Math.round((won / played) * 100) : null,
    titles,
  }
}

/** Résultat final du joueur dans chaque tournoi terminé, du plus récent au plus ancien. */
export function featsOfArms(
  tournaments: readonly Tournament[],
  userId: number | null,
): FeatOfArms[] {
  return tournaments
    .filter((t) => t.state === 'termine' && findMyTeam(t, userId))
    .toSorted((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''))
    .map((tournament) => {
      const progress = playerProgress(tournament, userId)
      const [result, tone]: [string, FeatTone] =
        progress.kind === 'champion'
          ? ['1er', 'gold']
          : progress.kind !== 'eliminated'
            ? ['Forfait', 'muted']
            : progress.round === 'Finale'
              ? ['Finaliste', 'silver']
              : progress.round === 'Demi-finale'
                ? ['Demi-finale', 'bronze']
                : ['Quart', 'muted']
      return {
        tournamentId: tournament.id,
        name: `${tournament.name} · ${tournament.game}`,
        result,
        tone,
      }
    })
}
