import { useCallback, useEffect } from 'react'
import { onTeamLost } from '../services/chat'
import * as myTeamApi from '../services/myTeam'
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
}

export type MyTeamEntry = { tournament: Tournament; team: TournamentTeam }

/**
 * Équipes du joueur dans les tournois pas encore terminés. Le back n'a pas de route
 * « mes équipes » : on les retrouve dans le détail des tournois, qui liste les membres.
 * Les tournois, demandes en cours et `requestToJoin` servent aussi à « Toutes les équipes ».
 */
export function useMyTeams() {
  const { tournaments, status, userId, requests, refresh, requestToJoin } = useTournaments()

  const entries: MyTeamEntry[] = tournaments
    .filter((t) => t.state !== 'termine')
    .flatMap((tournament) => {
      const team = findMyTeam(tournament, userId)
      return team ? [{ tournament, team }] : []
    })

  // Exclu ou équipe supprimée par le capitaine : on relit le tournoi, l'équipe disparaît (B-17).
  useEffect(
    () =>
      onTeamLost((teamId) => {
        const tournament = tournaments.find((t) => t.teams.some((team) => team.id === teamId))
        if (tournament) refresh(tournament.id).catch(() => {})
      }),
    [tournaments, refresh],
  )

  // Changement fait par un coéquipier : on relit son tournoi.
  useEffect(
    () =>
      myTeamApi.onTeamUpdated((tournamentId) => {
        refresh(tournamentId).catch(() => {})
      }),
    [refresh],
  )

  const actionsFor = useCallback(
    ({ tournament, team }: MyTeamEntry): TeamActions => {
      /** Écrit, puis relit le tournoi : le back reste la seule source de vérité. */
      const then = async (write: Promise<void>) => {
        await write
        await refresh(tournament.id)
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
      }
    },
    [refresh],
  )

  return { entries, status, userId, actionsFor, tournaments, requests, requestToJoin }
}
