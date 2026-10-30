import { useEffect, useState } from 'react'
import { fetchLastFinishedTournament } from '../services/tournaments'
import type { Podium } from '../types/tournament'
import { tournamentPodium } from '../utils/bracket'

/** Podium du dernier tournoi terminé : undefined pendant le chargement, null s'il n'y en a pas. */
export function usePodium() {
  const [podium, setPodium] = useState<Podium | null>()

  useEffect(() => {
    let cancelled = false
    fetchLastFinishedTournament()
      .then((tournament) => {
        if (!cancelled) setPodium(tournament && tournamentPodium(tournament))
      })
      .catch(() => {
        if (!cancelled) setPodium(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return podium
}
