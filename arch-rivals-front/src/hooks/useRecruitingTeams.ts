import { useEffect, useState } from 'react'
import { fetchRecruitingTeams } from '../services/teams'
import type { TeamListing } from '../types/tournament'

type Loaded = { tournamentId: string; teams: TeamListing[]; failed: boolean }

/** Équipes ouvertes et pas complètes d'un tournoi. */
export function useRecruitingTeams(tournamentId: string) {
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const current = loaded?.tournamentId === tournamentId ? loaded : null
  const status = !current ? 'loading' : current.failed ? 'error' : 'ready'

  useEffect(() => {
    let cancelled = false

    fetchRecruitingTeams(tournamentId)
      .then((teams) => {
        if (!cancelled) setLoaded({ tournamentId, teams, failed: false })
      })
      .catch(() => {
        if (!cancelled) setLoaded({ tournamentId, teams: [], failed: true })
      })

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  return { teams: current?.teams ?? [], status }
}
