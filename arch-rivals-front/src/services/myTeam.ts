import type { MyTeam, TeamVisibility } from '../types/team'
import { GAME_ROLES, PLAYERS_PER_TEAM } from '../utils/tournaments'
import { validateTeamName } from '../utils/validation'
import { ApiError } from './api'
import { db, findTournament, teamView } from './mockBackend'

// Contrat prévu avec le back (le joueur est identifié par son token) :
//   PATCH  /teams/:id                       { name } | { visibility }  → MyTeam
//   PATCH  /teams/:id/members/:memberId      { role }                   → MyTeam
//   POST   /teams/:id/captain                { memberId }               → MyTeam
//   DELETE /teams/:id/members/:memberId                                 → MyTeam  (exclusion)
//   POST   /teams/:id/requests/:requestId/accept                        → MyTeam
//   DELETE /teams/:id/requests/:requestId                               → MyTeam  (refus)
//   DELETE /teams/:id/members/me                                        → 204     (quitter)
// Seul le capitaine touche à la composition (403 sinon), et seulement tant que les inscriptions
// sont ouvertes (409 sinon) : B-09, B-10, B-11. Ici l'équipe est désignée par son tournoi,
// puisqu'un joueur n'a qu'une équipe par tournoi.

function findMyTeam(tournamentId: string) {
  const team = db.myTeams.find((t) => t.tournamentId === tournamentId)
  if (!team) throw new ApiError(404, 'Tu n’es pas dans cette équipe.')
  return team
}

function assertOpen(tournamentId: string) {
  const tournament = findTournament(tournamentId)
  if (tournament.state !== 'ouvertes')
    throw new ApiError(409, 'Les inscriptions sont closes : l’effectif est figé.')
  return tournament
}

/** Équipe modifiable par le joueur connecté : il en est le capitaine et les inscriptions sont ouvertes. */
function managedTeam(tournamentId: string) {
  const team = findMyTeam(tournamentId)
  assertOpen(tournamentId)
  if (team.captainId !== team.myMemberId)
    throw new ApiError(403, 'Seul le capitaine peut modifier l’équipe.')
  return team
}

function findMember(team: MyTeam, memberId: string) {
  const member = team.members.find((m) => m.id === memberId)
  if (!member) throw new ApiError(404, 'Ce joueur n’est pas dans l’équipe.')
  return member
}

/** Garde le résumé affiché sur la carte du tournoi (nom, rôle, capitaine) en phase avec l'équipe. */
function syncSummary(team: MyTeam) {
  const tournament = findTournament(team.tournamentId)
  const me = findMember(team, team.myMemberId)
  tournament.myTeam = { name: team.name, role: me.role, isCaptain: team.captainId === me.id }
  return teamView(team)
}

export async function renameTeam(tournamentId: string, name: string): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  const teamName = name.trim()
  const invalid = validateTeamName(teamName)
  if (invalid) throw new ApiError(422, invalid)
  const taken = db.teams.some(
    (t) => t.tournamentId === tournamentId && t.name.toLowerCase() === teamName.toLowerCase(),
  )
  if (taken) throw new ApiError(409, 'Ce nom est déjà pris dans ce tournoi.')
  team.name = teamName
  return syncSummary(team)
}

export async function setVisibility(
  tournamentId: string,
  visibility: TeamVisibility,
): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  team.visibility = visibility
  return syncSummary(team)
}

export async function setMemberRole(
  tournamentId: string,
  memberId: string,
  role: string,
): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  const { game } = findTournament(tournamentId)
  if (!GAME_ROLES[game].includes(role)) throw new ApiError(422, 'Rôle inconnu pour ce jeu.')
  findMember(team, memberId).role = role
  return syncSummary(team)
}

export async function transferCaptain(tournamentId: string, memberId: string): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  findMember(team, memberId)
  team.captainId = memberId
  // Les demandes passent au nouveau capitaine : teamView les masque désormais au joueur.
  return syncSummary(team)
}

export async function kickMember(tournamentId: string, memberId: string): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  if (memberId === team.myMemberId) throw new ApiError(409, 'Tu ne peux pas t’exclure toi-même.')
  findMember(team, memberId)
  team.members = team.members.filter((m) => m.id !== memberId)
  return syncSummary(team)
}

export async function acceptRequest(tournamentId: string, requestId: string): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  const request = team.requests.find((r) => r.id === requestId)
  if (!request) throw new ApiError(404, 'Demande introuvable.')
  if (team.members.length >= PLAYERS_PER_TEAM) throw new ApiError(409, 'L’équipe est complète.')

  // Le nouveau venu reçoit le premier rôle encore libre ; le capitaine pourra le changer.
  const roles = GAME_ROLES[findTournament(tournamentId).game]
  const used = new Set(team.members.map((m) => m.role))
  const role = roles.find((r) => !used.has(r)) ?? roles[0]
  team.members.push({ id: `m-${request.id}`, username: request.username, role })
  team.requests = team.requests.filter((r) => r.id !== requestId)
  return syncSummary(team)
}

export async function refuseRequest(tournamentId: string, requestId: string): Promise<MyTeam> {
  const team = managedTeam(tournamentId)
  team.requests = team.requests.filter((r) => r.id !== requestId)
  return syncSummary(team)
}

export async function leaveTeam(tournamentId: string): Promise<void> {
  const team = findMyTeam(tournamentId)
  const tournament = assertOpen(tournamentId)
  if (team.captainId === team.myMemberId)
    throw new ApiError(409, 'Passe d’abord le rôle de capitaine à un autre membre.')
  db.myTeams = db.myTeams.filter((t) => t !== team)
  tournament.myTeam = null
}
