import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { requestStorage } from '../services/requestStorage'
import * as teamsApi from '../services/teams'
import { fetchTournament, fetchTournaments } from '../services/tournaments'
import type { MyJoinRequest, Tournament, TournamentTeam } from '../types/tournament'
import { findMyTeam } from '../utils/tournaments'
import { useAuth } from './useAuth'

type Status = 'loading' | 'ready' | 'error'
type Requests = Record<number, MyJoinRequest>

/**
 * Ne garde que les demandes encore crédibles : tournoi aux inscriptions ouvertes et joueur
 * toujours sans équipe (une demande acceptée le fait apparaître dans une équipe).
 */
function stillPending(requests: Requests, tournaments: Tournament[], userId: number): Requests {
  return Object.fromEntries(
    Object.entries(requests).filter(([, r]) => {
      const t = tournaments.find((x) => x.id === r.tournamentId)
      return t?.state === 'ouvertes' && !findMyTeam(t, userId)
    }),
  )
}

export function useTournaments() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [requests, setRequests] = useState<Requests>({})
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetchTournaments()
      .then((list) => {
        if (cancelled) return
        setTournaments(list)
        if (userId !== null) {
          const kept = stillPending(requestStorage.load(userId), list, userId)
          requestStorage.save(userId, kept)
          setRequests(kept)
        }
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  const saveRequests = useCallback(
    (update: (current: Requests) => Requests) => {
      setRequests((current) => {
        const next = update(current)
        if (userId !== null) requestStorage.save(userId, next)
        return next
      })
    },
    [userId],
  )

  /** Relit un tournoi après une écriture : le back reste la seule source de vérité. */
  const refresh = useCallback(async (tournamentId: number) => {
    const updated = await fetchTournament(tournamentId)
    setTournaments((list) => list.map((t) => (t.id === updated.id ? updated : t)))
  }, [])

  // Les erreurs remontent à l'appelant, qui les affiche à côté du formulaire concerné.
  const createTeam = useCallback(
    async (tournamentId: number, name: string) => {
      await teamsApi.createTeam(tournamentId, name)
      // Le back annule les autres demandes du joueur dans ce tournoi.
      saveRequests(({ [tournamentId]: _cancelled, ...rest }) => rest)
      await refresh(tournamentId)
    },
    [refresh, saveRequests],
  )

  const requestToJoin = useCallback(
    async (tournamentId: number, team: TournamentTeam) => {
      const id = await teamsApi.requestToJoin(team.id)
      saveRequests((current) => ({
        ...current,
        [tournamentId]: { id, tournamentId, teamId: team.id, teamName: team.name },
      }))
    },
    [saveRequests],
  )

  const cancelRequest = useCallback(
    async (tournamentId: number) => {
      const request = requests[tournamentId]
      if (!request) return
      try {
        await teamsApi.cancelJoinRequest(request.id)
      } catch (err) {
        // 404 : la demande n'est plus en attente (acceptée ou refusée entre-temps).
        if (!(err instanceof ApiError && err.status === 404)) throw err
      }
      saveRequests(({ [tournamentId]: _cancelled, ...rest }) => rest)
      await refresh(tournamentId)
    },
    [requests, refresh, saveRequests],
  )

  return {
    tournaments,
    status,
    userId,
    requests,
    refresh,
    createTeam,
    requestToJoin,
    cancelRequest,
  }
}
