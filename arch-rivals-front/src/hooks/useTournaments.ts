import { useCallback, useEffect, useState } from 'react'
import * as teamsApi from '../services/teams'
import { fetchTournaments } from '../services/tournaments'
import type { TournamentDetail } from '../types/tournament'

type Status = 'loading' | 'ready' | 'error'

export function useTournaments() {
  const [tournaments, setTournaments] = useState<TournamentDetail[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetchTournaments()
      .then((list) => {
        if (cancelled) return
        setTournaments(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  /** Remplace un tournoi par la version renvoyée par le serveur après une écriture. */
  const replace = useCallback((updated: TournamentDetail) => {
    setTournaments((list) => list.map((t) => (t.id === updated.id ? updated : t)))
  }, [])

  // Les erreurs remontent à l'appelant, qui les affiche à côté du formulaire concerné.
  const createTeam = useCallback(
    async (tournamentId: string, name: string) => {
      replace(await teamsApi.createTeam(tournamentId, name))
    },
    [replace],
  )

  const requestToJoin = useCallback(
    async (tournamentId: string, teamId: string) => {
      replace(await teamsApi.requestToJoin(tournamentId, teamId))
    },
    [replace],
  )

  return { tournaments, status, createTeam, requestToJoin }
}
