import type { TournamentDetail } from '../types/tournament'
import { db, findTournament, toDetail } from './mockBackend'

// Contrat prévu avec le back :
//   GET /tournaments       Authorization: Bearer <token>  → TournamentDetail[]
//   GET /tournaments/:id   Authorization: Bearer <token>  → TournamentDetail  (404 si inconnu)
// avec myTeam = l'équipe du joueur connecté dans chaque tournoi (null s'il n'en a pas)
// et myRequest = sa demande en attente pour rejoindre une équipe (null s'il n'en a pas).
// L'arbre (8 équipes, 7 matchs) est borné : la liste peut l'embarquer, ce qui permet
// d'afficher le prochain match et l'avancement du joueur sans requête par tournoi.
// Tant que ces routes n'existent pas, on sert le faux back (mockBackend.ts) : le jour où elles
// arrivent, seul ce fichier change (api.get<TournamentDetail[]>('/tournaments'), etc.).

export async function fetchTournaments(): Promise<TournamentDetail[]> {
  return db.tournaments.map(toDetail)
}

export async function fetchTournament(id: string): Promise<TournamentDetail> {
  return toDetail(findTournament(id))
}
