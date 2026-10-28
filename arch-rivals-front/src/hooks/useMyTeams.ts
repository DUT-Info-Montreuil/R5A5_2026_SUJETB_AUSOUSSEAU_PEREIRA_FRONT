import { useCallback, useEffect } from 'react'
import { onTeamLost } from '../services/chat'
import * as myTeamApi from '../services/myTeam'
import type { Tournament, TournamentTeam } from '../types/tournament'
import { findMyTeam } from '../utils/tournaments'
import { useTournaments } from './useTournaments'

/** Actions sur une équipe donnée ; les erreurs remontent à l'appelant, qui les affiche. */
export type TeamActions = {
  rename: (name: string) => Promise<void>
  setRole: (userId: number, roleId: number | null) => Promise<void>
  transferCaptaincy: (userId: number) => Promise<void>
  kick: (userId: number) => Promise<void>
  accept: (requestId: number) => Promise<void>
  reject: (requestId: number) => Promise<void>
  leave: () => Promise<void>
  remove: () => Promise<void>
}

export type MyTeamEntry = { tournament: Tournament; team: TournamentTeam }

/**
 * Équipes du joueur dans les tournois pas encore terminés. Le back n'a pas de route
 * « mes équipes » : on les retrouve dans le détail des tournois, qui liste les membres.
 */
export function useMyTeams() {
  const { tournaments, status, userId, refresh } = useTournaments()

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

  const actionsFor = useCallback(
    ({ tournament, team }: MyTeamEntry): TeamActions => {
      /** Écrit, puis relit le tournoi : le back reste la seule source de vérité. */
      const then = async (write: Promise<void>) => {
        await write
        await refresh(tournament.id)
      }
      return {
        rename: (name) => then(myTeamApi.renameTeam(team.id, name)),
        setRole: (userId, roleId) => then(myTeamApi.setMemberRole(team.id, userId, roleId)),
        transferCaptaincy: (userId) => then(myTeamApi.transferCaptaincy(team.id, userId)),
        kick: (userId) => then(myTeamApi.kickMember(team.id, userId)),
        accept: (requestId) => then(myTeamApi.acceptJoinRequest(requestId)),
        reject: (requestId) => then(myTeamApi.rejectJoinRequest(requestId)),
        leave: () => then(myTeamApi.leaveTeam(team.id)),
        remove: () => then(myTeamApi.deleteTeam(team.id)),
      }
    },
    [refresh],
  )

  return { entries, status, userId, actionsFor }
}
