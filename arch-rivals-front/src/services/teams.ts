import type { TeamListing, TournamentDetail } from '../types/tournament'
import { GAME_ROLES, PLAYERS_PER_TEAM, TEAMS_PER_TOURNAMENT } from '../utils/tournaments'
import { validateTeamName } from '../utils/validation'
import { ApiError } from './api'
import { db, findTournament, toDetail } from './mockBackend'

// Contrat prévu avec le back (le joueur est identifié par son token) :
//   GET  /tournaments/:id/teams?recrute=1   → TeamListing[]  (ouvertes et pas complètes)
//   POST /tournaments/:id/teams  { name }   → 201 TournamentDetail  (le joueur devient capitaine)
//   POST /teams/:teamId/join-requests       → 201 TournamentDetail
// Erreurs : 409 si la règle métier refuse (déjà une équipe, demande en cours, tournoi complet,
// nom pris…), 422 si le nom est invalide. Le back revérifie tout : le front ne fait qu'aider.

function assertOpenAndFree(tournamentId: string) {
  const tournament = findTournament(tournamentId)
  if (tournament.state !== 'ouvertes') throw new ApiError(409, 'Les inscriptions sont closes.')
  if (tournament.myTeam) throw new ApiError(409, 'Tu as déjà une équipe dans ce tournoi.')
  if (tournament.myRequest) throw new ApiError(409, 'Tu as déjà une demande en cours.')
  return tournament
}

export async function fetchRecruitingTeams(tournamentId: string): Promise<TeamListing[]> {
  findTournament(tournamentId)
  return structuredClone(
    db.teams.filter(
      (t) =>
        t.tournamentId === tournamentId &&
        t.visibility === 'open' &&
        t.memberCount < PLAYERS_PER_TEAM,
    ),
  )
}

export async function createTeam(tournamentId: string, name: string): Promise<TournamentDetail> {
  const tournament = assertOpenAndFree(tournamentId)
  const teamName = name.trim()

  const invalid = validateTeamName(teamName)
  if (invalid) throw new ApiError(422, invalid)
  if (tournament.registeredTeams >= TEAMS_PER_TOURNAMENT)
    throw new ApiError(409, 'Le tournoi est complet.')
  const taken = db.teams.some(
    (t) => t.tournamentId === tournamentId && t.name.toLowerCase() === teamName.toLowerCase(),
  )
  if (taken) throw new ApiError(409, 'Ce nom est déjà pris dans ce tournoi.')

  tournament.myTeam = { name: teamName, role: GAME_ROLES[tournament.game][0], isCaptain: true }
  tournament.registeredTeams += 1
  return toDetail(tournament)
}

export async function requestToJoin(
  tournamentId: string,
  teamId: string,
): Promise<TournamentDetail> {
  const tournament = assertOpenAndFree(tournamentId)
  const team = db.teams.find((t) => t.id === teamId && t.tournamentId === tournamentId)
  if (!team) throw new ApiError(404, 'Équipe introuvable.')
  if (team.visibility === 'closed') throw new ApiError(409, 'Cette équipe est fermée aux demandes.')
  if (team.memberCount >= PLAYERS_PER_TEAM) throw new ApiError(409, 'Cette équipe est complète.')

  tournament.myRequest = { teamId: team.id, teamName: team.name }
  return toDetail(tournament)
}
