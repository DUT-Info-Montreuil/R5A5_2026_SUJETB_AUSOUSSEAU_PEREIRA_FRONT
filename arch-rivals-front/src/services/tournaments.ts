import { BRACKETS } from '../data/brackets'
import { TOURNAMENTS } from '../data/tournaments'
import type { Tournament, TournamentDetail } from '../types/tournament'
import { ApiError } from './api'

// Contrat prévu avec le back :
//   GET /tournaments       Authorization: Bearer <token>  → Tournament[]
//   GET /tournaments/:id   Authorization: Bearer <token>  → TournamentDetail  (404 si inconnu)
// avec myTeam = l'équipe du joueur connecté dans chaque tournoi (null s'il n'en a pas).
// Tant que ces routes n'existent pas, on sert les données mock : le jour où elles arrivent,
// seul ce fichier change (api.get<Tournament[]>('/tournaments'), etc.).

export async function fetchTournaments(): Promise<Tournament[]> {
  return [...TOURNAMENTS]
}

export async function fetchTournament(id: string): Promise<TournamentDetail> {
  const tournament = TOURNAMENTS.find((t) => t.id === id)
  if (!tournament) throw new ApiError(404, 'Tournoi introuvable.')
  const bracket = BRACKETS[id]
  return { ...tournament, teams: bracket?.teams ?? null, results: bracket?.results ?? {} }
}
