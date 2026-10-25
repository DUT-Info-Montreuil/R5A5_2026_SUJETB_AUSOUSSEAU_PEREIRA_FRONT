import { useEffect, useState } from 'react'
import { fetchTournaments } from '../services/tournaments'
import type { Tournament } from '../types/tournament'

type Status = 'loading' | 'ready' | 'error'

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
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

  return { tournaments, status }
}
