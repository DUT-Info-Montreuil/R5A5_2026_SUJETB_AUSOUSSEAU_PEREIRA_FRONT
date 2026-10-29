import type { FreeTeam } from '../types/team'
import type { MyJoinRequest, Tournament, TournamentTeam } from '../types/tournament'
import { findMyTeam, PLAYERS_PER_TEAM } from './tournaments'

/**
 * RECRUTE : place libre, équipe ouverte, inscriptions ouvertes (ou équipe hors tournoi) ;
 * INCOMPLÈTE : place libre mais équipe fermée aux demandes ; FIGÉE : inscriptions closes.
 */
export type DirectoryBadge = 'recrute' | 'incomplete' | 'complete' | 'figee'

/** Ce que le joueur peut faire depuis la carte d'une équipe. */
export type DirectoryAction =
  | 'manage' // sa propre équipe
  | 'join' // demander à rejoindre
  | 'private' // équipe fermée aux demandes
  | 'sent' // demande envoyée à cette équipe
  | 'busy' // demande déjà en cours vers une autre équipe du tournoi
  | 'engaged' // déjà dans une autre équipe du tournoi
  | null

export type DirectoryEntry = {
  team: TournamentTeam
  /** null : équipe hors tournoi. */
  tournament: Tournament | null
  /** Nom du tournoi, ou « Hors tournoi ». */
  context: string
  game: string
  captain: string | null
  mine: boolean
  /** « ♛ CAPITAINE », le rôle du joueur, ou null s'il n'en a pas. */
  myRole: string | null
  badge: DirectoryBadge
  action: DirectoryAction
}

function badgeOf(tournament: Tournament | null, team: TournamentTeam): DirectoryBadge {
  if (tournament && tournament.state !== 'ouvertes') return 'figee'
  if (team.members.length >= PLAYERS_PER_TEAM) return 'complete'
  return team.visibility === 'private' ? 'incomplete' : 'recrute'
}

function actionOf(
  entry: Omit<DirectoryEntry, 'action'>,
  myTeam: TournamentTeam | null,
  request: MyJoinRequest | undefined,
): DirectoryAction {
  if (entry.mine) return 'manage'
  if (entry.badge === 'incomplete') return 'private'
  if (entry.badge !== 'recrute') return null
  if (myTeam) return 'engaged'
  if (request) return request.teamId === entry.team.id ? 'sent' : 'busy'
  return 'join'
}

function entryOf(
  team: TournamentTeam,
  tournament: Tournament | null,
  game: string,
  userId: number | null,
): Omit<DirectoryEntry, 'action'> {
  const me = team.members.find((m) => m.userId === userId)
  return {
    team,
    tournament,
    context: tournament?.name ?? 'Hors tournoi',
    game,
    captain: team.members.find((m) => m.isCaptain)?.username ?? null,
    mine: me !== undefined,
    myRole: !me ? null : me.isCaptain ? '♛ CAPITAINE' : (me.role?.name.toUpperCase() ?? null),
    badge: badgeOf(tournament, team),
  }
}

/**
 * Toutes les équipes des tournois pas encore terminés (B-06), puis les équipes hors tournoi ;
 * celles du joueur en tête. Les tournois chargés listent déjà leurs équipes.
 * Hors tournoi, une demande par équipe : aucune n'en bloque une autre.
 */
export function teamDirectory(
  tournaments: readonly Tournament[],
  freeTeams: readonly FreeTeam[],
  userId: number | null,
  requests: Record<number, MyJoinRequest>,
  freeRequests: Record<number, MyJoinRequest>,
): DirectoryEntry[] {
  const inTournaments = tournaments
    .filter((t) => t.state !== 'termine')
    .flatMap((tournament) => {
      const myTeam = findMyTeam(tournament, userId)
      return tournament.teams.map((team) => {
        const base = entryOf(team, tournament, tournament.game, userId)
        return { ...base, action: actionOf(base, myTeam, requests[tournament.id]) }
      })
    })
  const free = freeTeams.map(({ team, game }) => {
    const base = entryOf(team, null, game.name, userId)
    return { ...base, action: actionOf(base, null, freeRequests[team.id]) }
  })
  return [...inTournaments, ...free].toSorted((a, b) => Number(b.mine) - Number(a.mine))
}

/** Recherche par équipe, tournoi, jeu ou capitaine. */
export function matchesTeamQuery(entry: DirectoryEntry, query: string) {
  const q = query.trim().toLowerCase()
  const haystack = `${entry.team.name} ${entry.context} ${entry.game} ${entry.captain ?? ''}`
  return !q || haystack.toLowerCase().includes(q)
}
