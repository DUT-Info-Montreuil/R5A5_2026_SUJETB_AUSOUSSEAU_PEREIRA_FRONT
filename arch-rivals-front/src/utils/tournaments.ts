import type { Tournament, TournamentState, TournamentTeam } from '../types/tournament'

export const TEAMS_PER_TOURNAMENT = 8
export const PLAYERS_PER_TEAM = 5

export const TOURNAMENT_FORMAT = `${TEAMS_PER_TOURNAMENT} équipes de ${PLAYERS_PER_TEAM} · Élim. directe`

export const STATE_LABELS: Record<TournamentState, string> = {
  ouvertes: 'INSCRIPTIONS OUVERTES',
  closes: 'INSCRIPTIONS CLOSES',
  cours: 'EN COURS',
  termine: 'TERMINÉ',
}

/** Équipe du joueur dans ce tournoi (un joueur n'a qu'une équipe par tournoi, B-07). */
export function findMyTeam(tournament: Tournament, userId: number | null): TournamentTeam | null {
  if (userId === null) return null
  return tournament.teams.find((t) => t.members.some((m) => m.userId === userId)) ?? null
}

/** Le joueur peut créer ou rejoindre une équipe : inscriptions ouvertes, sans équipe ni demande. */
export function canJoinOrCreate(
  tournament: Tournament,
  userId: number | null,
  hasRequest: boolean,
) {
  return tournament.state === 'ouvertes' && !hasRequest && !findMyTeam(tournament, userId)
}

const shortDate = (iso: string) => {
  const date = new Date(iso)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    ...(!sameYear && { year: 'numeric' }),
  })
}

/** Date la plus parlante selon l'état : le back ne fournit pas de date de début ni de clôture prévue. */
export function dateLabel(tournament: Tournament) {
  const { state, createdAt, closedAt, startedAt, finishedAt } = tournament
  if (state === 'termine' && finishedAt) return `Terminé le ${shortDate(finishedAt)}`
  if (state === 'cours' && startedAt) return `Lancé le ${shortDate(startedAt)}`
  if (state === 'closes' && closedAt) return `Inscriptions closes le ${shortDate(closedAt)}`
  return `Ouvert le ${shortDate(createdAt)}`
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
