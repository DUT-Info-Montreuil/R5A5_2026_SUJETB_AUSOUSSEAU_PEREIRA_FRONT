import { useEffect, useState } from 'react'
import { fetchFeaturedTournamentId } from '../services/tournaments'

type Featured = { status: 'loading' } | { status: 'ready'; id: number | null } | { status: 'error' }

/** Identifiant du tournoi à montrer aux visiteurs (voir fetchFeaturedTournamentId). */
export function useFeaturedTournamentId() {
  const [featured, setFeatured] = useState<Featured>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    fetchFeaturedTournamentId()
      .then((id) => {
        if (!cancelled) setFeatured({ status: 'ready', id })
      })
      .catch(() => {
        if (!cancelled) setFeatured({ status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return featured
}
