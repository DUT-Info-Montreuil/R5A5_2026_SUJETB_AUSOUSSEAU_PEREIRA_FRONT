import { useEffect, useState } from 'react'
import { fetchGames } from '../services/games'
import type { Game } from '../types/game'

type Status = 'loading' | 'ready' | 'error'

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetchGames()
      .then((list) => {
        if (cancelled) return
        setGames(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { games, status }
}
