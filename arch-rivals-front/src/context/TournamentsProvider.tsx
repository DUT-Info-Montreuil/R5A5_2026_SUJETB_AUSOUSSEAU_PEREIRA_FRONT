import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../services/api'
import * as teamsApi from '../services/teams'
import { fetchTournament, fetchTournaments } from '../services/tournaments'
import type { MyJoinRequest, Tournament, TournamentTeam } from '../types/tournament'
import {
  TournamentsContext,
  type Requests,
  type TournamentsContextValue,
  type TournamentsStatus,
} from './tournamentsContext'

/** Une demande par tournoi : le back annule les autres quand le joueur entre dans une équipe. */
const byTournament = (list: MyJoinRequest[]): Requests =>
  Object.fromEntries(list.map((r) => [r.tournamentId, r]))

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
    inFlight.current ??= Promise.all([fetchTournaments(), teamsApi.fetchMyPendingRequests()])
      .then(([list, pending]) => {
        setTournaments(list)
        setRequests(byTournament(pending))
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
  }, [])

  const forgetRequest = useCallback(
    (tournamentId: number) => setRequests(({ [tournamentId]: _done, ...rest }) => rest),
    [],
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
      forgetRequest(tournamentId)
      await refresh(tournamentId)
    },
    [refresh, forgetRequest],
  )

  const requestToJoin = useCallback(async (tournamentId: number, team: TournamentTeam) => {
    const id = await teamsApi.requestToJoin(team.id)
    setRequests((current) => ({
      ...current,
      [tournamentId]: { id, tournamentId, teamId: team.id, teamName: team.name },
    }))
  }, [])

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
      forgetRequest(tournamentId)
      await refresh(tournamentId)
    },
    [requests, refresh, forgetRequest],
  )

  // Ma demande acceptée, refusée ou annulée par le back : on l'oublie et on relit le tournoi
  // (acceptée, le joueur apparaît dans l'équipe).
  useEffect(
    () =>
      teamsApi.onMyRequestDecided((request) => {
        setRequests((current) =>
          current[request.tournamentId]?.id === request.id
            ? (({ [request.tournamentId]: _done, ...rest }) => rest)(current)
            : current,
        )
        refresh(request.tournamentId).catch(() => {})
      }),
    [refresh],
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
