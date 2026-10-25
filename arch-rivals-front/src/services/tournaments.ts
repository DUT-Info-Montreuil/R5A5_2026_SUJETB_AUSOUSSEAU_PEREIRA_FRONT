import { TOURNAMENTS } from '../data/tournaments'
import type { Tournament } from '../types/tournament'

// Contrat prévu avec le back :
//   GET /tournaments   Authorization: Bearer <token>  → Tournament[]
// avec myTeam = l'équipe du joueur connecté dans chaque tournoi (null s'il n'en a pas).
// Tant que la route n'existe pas, on sert les données mock : le jour où elle arrive,
// seul ce fichier change (api.get<Tournament[]>('/tournaments')).

export async function fetchTournaments(): Promise<Tournament[]> {
  return [...TOURNAMENTS]
}
