import { useContext, useEffect } from 'react'
import { TournamentsContext } from '../context/tournamentsContext'

/**
 * Tournois de l'espace joueur (voir TournamentsProvider). Chaque composant qui s'en sert relit la
 * liste à son ouverture : changer de page montre l'état à jour du back.
 */
export function useTournaments() {
  const ctx = useContext(TournamentsContext)
  if (!ctx) throw new Error('useTournaments doit être utilisé dans <TournamentsProvider>.')
  const { reload } = ctx

  useEffect(() => {
    void reload()
  }, [reload])

  return ctx
}
