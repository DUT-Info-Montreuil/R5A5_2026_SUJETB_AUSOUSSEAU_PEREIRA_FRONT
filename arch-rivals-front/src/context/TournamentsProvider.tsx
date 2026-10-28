import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'
import { requestStorage } from '../services/requestStorage'
import * as teamsApi from '../services/teams'
import { fetchTournament, fetchTournaments } from '../services/tournaments'
import type { Tournament, TournamentTeam } from '../types/tournament'
import { findMyTeam } from '../utils/tournaments'
import {
  TournamentsContext,
  type Requests,
  type TournamentsContextValue,
  type TournamentsStatus,
} from './tournamentsContext'

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

/**
 * Tournois partagés par tout l'espace joueur : l'en-tête (badge « Équipes ») et les pages lisent
 * les mêmes données. Chaque page relit la liste à son ouverture (voir useTournaments).
 */
export default function TournamentsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [requests, setRequests] = useState<Requests>({})
  const [status, setStatus] = useState<TournamentsStatus>('loading')
  const inFlight = useRef<Promise<void> | null>(null)

  const reload = useCallback(() => {
    // L'en-tête et la page s'ouvrent ensemble : une seule lecture pour les deux.
    inFlight.current ??= fetchTournaments()
      .then((list) => {
        setTournaments(list)
        if (userId !== null) {
          const kept = stillPending(requestStorage.load(userId), list, userId)
          requestStorage.save(userId, kept)
          setRequests(kept)
        }
        setStatus('ready')
      })
      .catch(() => {
        // Données déjà affichées : on les garde plutôt que d'afficher une erreur.
        setStatus((current) => (current === 'ready' ? current : 'error'))
      })
      .finally(() => {
        inFlight.current = null
      })
    return inFlight.current
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

  const value = useMemo<TournamentsContextValue>(
    () => ({
      tournaments,
      status,
      userId,
      requests,
      reload,
      refresh,
      createTeam,
      requestToJoin,
      cancelRequest,
    }),
    [
      tournaments,
      status,
      userId,
      requests,
      reload,
      refresh,
      createTeam,
      requestToJoin,
      cancelRequest,
    ],
  )

  return <TournamentsContext.Provider value={value}>{children}</TournamentsContext.Provider>
}
