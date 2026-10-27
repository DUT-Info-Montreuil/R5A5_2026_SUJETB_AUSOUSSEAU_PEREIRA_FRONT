import { useEffect, useState } from 'react'
import { fetchMyTeams } from '../services/teams'
import type { MyTeam } from '../types/team'

type Status = 'loading' | 'ready' | 'error'

export function useMyTeams() {
  const [teams, setTeams] = useState<MyTeam[]>([])
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let cancelled = false

    fetchMyTeams()
      .then((list) => {
        if (cancelled) return
        setTeams(list)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { teams, status }
}
