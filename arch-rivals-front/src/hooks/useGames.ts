import { useEffect, useState } from 'react'
import { fetchGames } from '../services/games'
import type { Game } from '../types/game'

/** Jeux et rôles (GET /api/games, lu une fois par session). */
export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  useEffect(() => {
    let cancelled = false
    fetchGames()
      .then((list) => {
        if (!cancelled) setGames(list)
      })
      .catch(() => {
        /* liste vide : le formulaire de création reste fermé */
      })
    return () => {
      cancelled = true
    }
  }, [])
  return games
}
