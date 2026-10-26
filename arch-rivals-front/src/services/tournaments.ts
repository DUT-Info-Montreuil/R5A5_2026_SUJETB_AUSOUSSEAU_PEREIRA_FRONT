import { BRACKETS } from '../data/brackets'
import { TOURNAMENTS } from '../data/tournaments'
import type { Tournament, TournamentDetail } from '../types/tournament'
import { ApiError } from './api'

// Contrat prévu avec le back :
//   GET /tournaments       Authorization: Bearer <token>  → TournamentDetail[]
//   GET /tournaments/:id   Authorization: Bearer <token>  → TournamentDetail  (404 si inconnu)
// avec myTeam = l'équipe du joueur connecté dans chaque tournoi (null s'il n'en a pas).
// L'arbre (8 équipes, 7 matchs) est borné : la liste peut l'embarquer, ce qui permet
// d'afficher le prochain match et l'avancement du joueur sans requête par tournoi.
// Tant que ces routes n'existent pas, on sert les données mock : le jour où elles arrivent,
// seul ce fichier change (api.get<TournamentDetail[]>('/tournaments'), etc.).

function withBracket(tournament: Tournament): TournamentDetail {
  const bracket = BRACKETS[tournament.id]
  return { ...tournament, teams: bracket?.teams ?? null, results: bracket?.results ?? {} }
}

export async function fetchTournaments(): Promise<TournamentDetail[]> {
  return TOURNAMENTS.map(withBracket)
}

export async function fetchTournament(id: string): Promise<TournamentDetail> {
  const tournament = TOURNAMENTS.find((t) => t.id === id)
  if (!tournament) throw new ApiError(404, 'Tournoi introuvable.')
  return withBracket(tournament)
}
