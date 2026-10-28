import type { Tournament, TournamentState } from '../types/tournament'

export const TEAMS_PER_TOURNAMENT = 8
export const PLAYERS_PER_TEAM = 5

export const TOURNAMENT_FORMAT = `${TEAMS_PER_TOURNAMENT} équipes de ${PLAYERS_PER_TEAM} · Élim. directe`

export const STATE_LABELS: Record<TournamentState, string> = {
  ouvertes: 'INSCRIPTIONS OUVERTES',
  closes: 'INSCRIPTIONS CLOSES',
  cours: 'EN COURS',
  termine: 'TERMINÉ',
}

/** Le joueur peut créer ou rejoindre une équipe : inscriptions ouvertes, sans équipe ni demande. */
export function canJoinOrCreate(tournament: Tournament) {
  return tournament.state === 'ouvertes' && !tournament.myTeam && !tournament.myRequest
}

export type TournamentTab = 'cours' | 'avenir' | 'termines'

export const TOURNAMENT_TABS: readonly {
  id: TournamentTab
  label: string
  states: TournamentState[]
}[] = [
  { id: 'cours', label: 'En cours', states: ['cours'] },
  { id: 'avenir', label: 'À venir', states: ['ouvertes', 'closes'] },
  { id: 'termines', label: 'Terminés', states: ['termine'] },
]

export function isTournamentTab(value: string | null): value is TournamentTab {
  return TOURNAMENT_TABS.some((tab) => tab.id === value)
}

export function inTab(tournament: Tournament, tab: TournamentTab) {
  return TOURNAMENT_TABS.find((t) => t.id === tab)!.states.includes(tournament.state)
}

/** Recherche insensible à la casse sur le nom du tournoi et le jeu. */
export function matchesQuery(tournament: Tournament, query: string) {
  const q = query.trim().toLowerCase()
  return !q || `${tournament.name} ${tournament.game}`.toLowerCase().includes(q)
}
