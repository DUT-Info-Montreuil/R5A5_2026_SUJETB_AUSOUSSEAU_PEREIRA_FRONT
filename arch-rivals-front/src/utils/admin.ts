import type { Tournament, TournamentState, TournamentTeam } from '../types/tournament'
import { PLAYERS_PER_TEAM, TEAMS_PER_TOURNAMENT } from './tournaments'

/** Filtre de la liste des tournois de l'administrateur (`?etat=` dans l'URL). */
export type AdminFilter = 'tous' | TournamentState

export const ADMIN_FILTERS: readonly { id: AdminFilter; label: string }[] = [
  { id: 'tous', label: 'Tous' },
  { id: 'ouvertes', label: 'Inscriptions' },
  { id: 'closes', label: 'À lancer' },
  { id: 'cours', label: 'En cours' },
  { id: 'termine', label: 'Terminés' },
]

export const isAdminFilter = (value: string | null): value is AdminFilter =>
  ADMIN_FILTERS.some((f) => f.id === value)

export const inFilter = (tournament: Tournament, filter: AdminFilter) =>
  filter === 'tous' || tournament.state === filter

/** Matchs jouables (deux équipes connues, B-14) qui attendent un résultat. */
export const matchesToReferee = (tournament: Tournament) =>
  tournament.state === 'cours' ? tournament.matches.filter((m) => m.status === 'ready').length : 0

/** La prochaine décision attendue de l'administrateur, ou null. */
export function nextStep(tournament: Tournament): string | null {
  switch (tournament.state) {
    case 'ouvertes':
      return tournament.teams.length === TEAMS_PER_TOURNAMENT ? 'Prêt à clore' : null
    case 'closes':
      return 'À lancer'
    case 'cours': {
      const count = matchesToReferee(tournament)
      return count ? `${count} match${count > 1 ? 's' : ''} à arbitrer` : null
    }
    default:
      return null
  }
}

/**
 * Pourquoi une équipe est incomplète au lancement (B-04, B-08) : moins de cinq joueurs, ou un
 * joueur sans rôle. null si elle est au complet. Le back applique la même règle au lancement.
 */
export function incompleteReason(team: TournamentTeam): string | null {
  const missing = PLAYERS_PER_TEAM - team.members.length
  if (missing > 0)
    return `${missing} joueur${missing > 1 ? 's' : ''} manquant${missing > 1 ? 's' : ''}`
  const noRole = team.members.filter((m) => !m.role).length
  if (noRole) return `${noRole} joueur${noRole > 1 ? 's' : ''} sans rôle`
  return null
}
