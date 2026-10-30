import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../services/api'
import { fetchTournament, subscribeToTournament } from '../services/tournaments'
import type { Tournament } from '../types/tournament'

type Status = 'loading' | 'ready' | 'not-found' | 'error'

type Loaded = {
  id: number
  tournament: Tournament | null
  status: Exclude<Status, 'loading'>
}

/** Un résultat pousse plusieurs événements (match, tournoi) : on les regroupe en une relecture. */
const COALESCE_MS = 150

export function useTournament(id: number) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  // Relecture demandée par l'écran (après une action de l'administrateur).
  const [version, setVersion] = useState(0)
  const reload = useCallback(() => setVersion((v) => v + 1), [])

  // Tant que la réponse pour cet id n'est pas arrivée, on est en chargement.
  const current = loaded?.id === id ? loaded : null
  const status: Status = current?.status ?? 'loading'
  const tournament = current?.tournament ?? null
  const live = tournament?.state === 'cours'

  useEffect(() => {
    let cancelled = false

    fetchTournament(id)
      .then((data) => {
        if (!cancelled) setLoaded({ id, tournament: data, status: 'ready' })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const notFound = err instanceof ApiError && err.status === 404
        // Une relecture qui échoue garde le dernier tournoi connu.
        setLoaded((prev) =>
          prev?.id === id && prev.tournament && !notFound
            ? prev
            : { id, tournament: null, status: notFound ? 'not-found' : 'error' },
        )
      })

    return () => {
      cancelled = true
    }
  }, [id, version])

  // Suivi en direct (B-19) : chaque changement poussé par le back relit le tournoi.
  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const reload = () => {
      fetchTournament(id)
        .then((data) => {
          if (!cancelled) setLoaded({ id, tournament: data, status: 'ready' })
        })
        .catch(() => {
          /* on garde le dernier arbre connu */
        })
    }
    const unsubscribe = subscribeToTournament(id, () => {
      clearTimeout(timer)
      timer = setTimeout(reload, COALESCE_MS)
    })

    return () => {
      cancelled = true
      clearTimeout(timer)
      unsubscribe()
    }
  }, [id])

  return { tournament, status, live, reload }
}
