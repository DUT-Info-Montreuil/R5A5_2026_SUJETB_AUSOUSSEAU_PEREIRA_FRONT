import type { MyJoinRequest, Tournament, TournamentTeam } from '../types/tournament'
import { findMyTeam, PLAYERS_PER_TEAM } from './tournaments'

/** RECRUTE : inscriptions ouvertes et place libre ; FIGÉE : inscriptions closes. */
export type DirectoryBadge = 'recrute' | 'complete' | 'figee'

/** Ce que le joueur peut faire depuis la carte d'une équipe. */
export type DirectoryAction =
  | 'manage' // sa propre équipe
  | 'join' // demander à rejoindre
  | 'sent' // demande envoyée à cette équipe
  | 'busy' // demande déjà en cours vers une autre équipe du tournoi
  | 'engaged' // déjà dans une autre équipe du tournoi
  | null

export type DirectoryEntry = {
  team: TournamentTeam
  tournament: Tournament
  captain: string | null
  mine: boolean
  /** « ♛ CAPITAINE », le rôle du joueur, ou null s'il n'en a pas. */
  myRole: string | null
  badge: DirectoryBadge
  action: DirectoryAction
}

function badgeOf(tournament: Tournament, team: TournamentTeam): DirectoryBadge {
  if (tournament.state !== 'ouvertes') return 'figee'
  return team.members.length < PLAYERS_PER_TEAM ? 'recrute' : 'complete'
}

function actionOf(
  entry: Omit<DirectoryEntry, 'action'>,
  myTeam: TournamentTeam | null,
  request: MyJoinRequest | undefined,
): DirectoryAction {
  if (entry.mine) return 'manage'
  if (entry.badge !== 'recrute') return null
  if (myTeam) return 'engaged'
  if (request) return request.teamId === entry.team.id ? 'sent' : 'busy'
  return 'join'
}

/**
 * Toutes les équipes des tournois pas encore terminés (B-06), celles du joueur en tête.
 * Les tournois chargés listent déjà leurs équipes : pas besoin de les redemander au back.
 */
export function teamDirectory(
  tournaments: readonly Tournament[],
  userId: number | null,
  requests: Record<number, MyJoinRequest>,
): DirectoryEntry[] {
  const entries = tournaments
    .filter((t) => t.state !== 'termine')
    .flatMap((tournament) => {
      const myTeam = findMyTeam(tournament, userId)
      return tournament.teams.map((team) => {
        const me = team.members.find((m) => m.userId === userId)
        const base = {
          team,
          tournament,
          captain: team.members.find((m) => m.isCaptain)?.username ?? null,
          mine: me !== undefined,
          myRole: !me ? null : me.isCaptain ? '♛ CAPITAINE' : (me.role?.name.toUpperCase() ?? null),
          badge: badgeOf(tournament, team),
        }
        return { ...base, action: actionOf(base, myTeam, requests[tournament.id]) }
      })
    })
  return entries.toSorted((a, b) => Number(b.mine) - Number(a.mine))
}

/** Recherche par équipe, tournoi, jeu ou capitaine. */
export function matchesTeamQuery(entry: DirectoryEntry, query: string) {
  const q = query.trim().toLowerCase()
  const haystack = `${entry.team.name} ${entry.tournament.name} ${entry.tournament.game} ${entry.captain ?? ''}`
  return !q || haystack.toLowerCase().includes(q)
}
