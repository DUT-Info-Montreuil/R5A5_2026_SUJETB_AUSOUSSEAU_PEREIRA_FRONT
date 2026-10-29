import { useEffect, useState } from 'react'
import { fetchProfileStats } from '../services/users'
import type { ProfileStats } from '../types/profile'
import { FEATS_SHOWN } from '../utils/profile'

type Loaded = { userId: number; stats: ProfileStats | null }

/** Statistiques et derniers faits d'armes d'un joueur (GET /api/users/:id/stats). */
export function useProfileStats(userId: number | null) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const current = loaded?.userId === userId ? loaded : null
  const status = !current ? 'loading' : current.stats ? 'ready' : 'error'

  useEffect(() => {
    if (userId === null) return
    let cancelled = false
    fetchProfileStats(userId, FEATS_SHOWN)
      .then((stats) => {
        if (!cancelled) setLoaded({ userId, stats })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ userId, stats: null })
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { stats: current?.stats ?? null, status }
}
