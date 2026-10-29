import { useCallback, useEffect } from 'react'
import { onTeamLost } from '../services/chat'
import * as myTeamApi from '../services/myTeam'
import type { Game } from '../types/game'
import type { IncomingRequest } from '../types/team'
import type { TeamVisibility, Tournament, TournamentTeam } from '../types/tournament'
import { findMyTeam } from '../utils/tournaments'
import { useTournaments } from './useTournaments'

/** Actions sur une équipe donnée ; les erreurs remontent à l'appelant, qui les affiche. */
export type TeamActions = {
  rename: (name: string) => Promise<void>
  setVisibility: (visibility: TeamVisibility) => Promise<void>
  setRole: (userId: number, roleId: number | null) => Promise<void>
  transferCaptaincy: (userId: number) => Promise<void>
  kick: (userId: number) => Promise<void>
  accept: (request: IncomingRequest) => Promise<void>
  reject: (request: IncomingRequest) => Promise<void>
  leave: () => Promise<void>
  remove: () => Promise<void>
  /** Équipe hors tournoi : l'inscrire à un tournoi (capitaine). */
  register: (tournament: Tournament) => Promise<void>
}

/** Une de mes équipes : inscrite à un tournoi, ou hors tournoi (`tournament` à null). */
export type MyTeamEntry = { team: TournamentTeam; tournament: Tournament | null; game: Game }

/**
 * Équipes du joueur : celles des tournois pas encore terminés (retrouvées dans le détail des
 * tournois, qui liste les membres), puis ses équipes hors tournoi.
 * Les tournois, demandes en cours et `requestToJoin` servent aussi à « Toutes les équipes ».
 */
export function useMyTeams() {
  const tournamentsData = useTournaments()
  const { tournaments, freeTeams, userId, reload, refresh, registerTeam } = tournamentsData

  const entries: MyTeamEntry[] = [
    ...tournaments
      .filter((t) => t.state !== 'termine')
      .flatMap((tournament) => {
        const team = findMyTeam(tournament, userId)
        const game = { id: tournament.gameId, name: tournament.game, roles: tournament.roles }
        return team ? [{ team, tournament, game }] : []
      }),
    ...freeTeams.map(({ team, game }) => ({ team, tournament: null, game })),
  ]

  /** Relit ce qui contient l'équipe : son tournoi, ou tout pour une équipe hors tournoi. */
  const refreshTeam = useCallback(
    (tournamentId: number | null) => (tournamentId === null ? reload() : refresh(tournamentId)),
    [reload, refresh],
  )

  // Exclu ou équipe supprimée par le capitaine : l'équipe disparaît (B-17).
  useEffect(
    () =>
      onTeamLost((teamId) => {
        const tournament = tournaments.find((t) => t.teams.some((team) => team.id === teamId))
        refreshTeam(tournament?.id ?? null).catch(() => {})
      }),
    [tournaments, refreshTeam],
  )

  // Changement fait par un coéquipier : on relit son équipe.
  useEffect(
    () =>
      myTeamApi.onTeamUpdated((tournamentId) => {
        refreshTeam(tournamentId).catch(() => {})
      }),
    [refreshTeam],
  )

  const actionsFor = useCallback(
    ({ tournament, team }: MyTeamEntry): TeamActions => {
      /** Écrit, puis relit l'équipe : le back reste la seule source de vérité. */
      const then = async (write: Promise<void>) => {
        await write
        await refreshTeam(tournament?.id ?? null)
      }
      return {
        rename: (name) => then(myTeamApi.renameTeam(team.id, name)),
        setVisibility: (visibility) => then(myTeamApi.setTeamVisibility(team.id, visibility)),
        setRole: (userId, roleId) => then(myTeamApi.setMemberRole(team.id, userId, roleId)),
        transferCaptaincy: (userId) => then(myTeamApi.transferCaptaincy(team.id, userId)),
        kick: (userId) => then(myTeamApi.kickMember(team.id, userId)),
        accept: (request) => then(myTeamApi.acceptJoinRequest(request.id)),
        reject: (request) => then(myTeamApi.rejectJoinRequest(request.id)),
        leave: () => then(myTeamApi.leaveTeam(team.id)),
        remove: () => then(myTeamApi.deleteTeam(team.id)),
        register: (target) => registerTeam(team.id, target.id),
      }
    },
    [refreshTeam, registerTeam],
  )

  return { ...tournamentsData, entries, actionsFor }
}
