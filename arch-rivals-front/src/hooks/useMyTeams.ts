import { useCallback, useEffect, useState } from 'react'
import * as myTeamApi from '../services/myTeam'
import { fetchMyTeams } from '../services/teams'
import type { MyTeam, TeamVisibility } from '../types/team'

type Status = 'loading' | 'ready' | 'error'

/** Actions sur une équipe donnée ; les erreurs remontent à l'appelant, qui les affiche. */
export type TeamActions = {
  rename: (name: string) => Promise<void>
  setVisibility: (visibility: TeamVisibility) => Promise<void>
  setRole: (memberId: string, role: string) => Promise<void>
  transferCaptain: (memberId: string) => Promise<void>
  kick: (memberId: string) => Promise<void>
  accept: (requestId: string) => Promise<void>
  refuse: (requestId: string) => Promise<void>
  leave: () => Promise<void>
}

export function useMyTeams() {
  const [teams, setTeams] = useState<MyTeam[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetchMyTeams()
      .then((list) => {
        if (cancelled) return
        setTeams(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  /** Attend la réponse du serveur, puis remplace l'équipe par la version renvoyée. */
  const apply = useCallback(async (call: Promise<MyTeam>) => {
    const updated = await call
    setTeams((list) => list.map((t) => (t.tournamentId === updated.tournamentId ? updated : t)))
  }, [])

  const actionsFor = useCallback(
    (tournamentId: string): TeamActions => ({
      rename: (name) => apply(myTeamApi.renameTeam(tournamentId, name)),
      setVisibility: (visibility) => apply(myTeamApi.setVisibility(tournamentId, visibility)),
      setRole: (memberId, role) => apply(myTeamApi.setMemberRole(tournamentId, memberId, role)),
      transferCaptain: (memberId) => apply(myTeamApi.transferCaptain(tournamentId, memberId)),
      kick: (memberId) => apply(myTeamApi.kickMember(tournamentId, memberId)),
      accept: (requestId) => apply(myTeamApi.acceptRequest(tournamentId, requestId)),
      refuse: (requestId) => apply(myTeamApi.refuseRequest(tournamentId, requestId)),
      leave: async () => {
        await myTeamApi.leaveTeam(tournamentId)
        setTeams((list) => list.filter((t) => t.tournamentId !== tournamentId))
      },
    }),
    [apply],
  )

  return { teams, status, actionsFor }
}
