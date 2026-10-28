import { useCallback, useEffect, useState } from 'react'
import { fetchJoinRequests } from '../services/myTeam'
import type { IncomingRequest } from '../types/team'

type Loaded = { teamId: number; requests: IncomingRequest[] }

/**
 * Demandes reçues par l'équipe, réservées au capitaine (403 sinon) : `enabled` évite de les
 * demander quand le joueur n'est pas capitaine ou que les inscriptions sont closes.
 * `version` change à chaque modification de l'équipe, ce qui relance la lecture.
 */
export function useJoinRequests(teamId: number, enabled: boolean, version: unknown) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [failed, setFailed] = useState(false)

  const load = useCallback(
    (isCancelled: () => boolean) => {
      fetchJoinRequests(teamId)
        .then((requests) => {
          if (isCancelled()) return
          setLoaded({ teamId, requests })
          setFailed(false)
        })
        .catch(() => {
          if (!isCancelled()) setFailed(true)
        })
    },
    [teamId],
  )

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    load(() => cancelled)
    return () => {
      cancelled = true
    }
  }, [enabled, load, version])

  const requests = enabled && loaded?.teamId === teamId ? loaded.requests : []
  return { requests, failed: enabled && failed }
}
