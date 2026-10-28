import { MY_TEAMS } from '../data/myTeams'
import type { MyTeam } from '../types/team'
import type { TournamentState } from '../types/tournament'
import { ApiError } from './api'

// Reste du faux back en mémoire : seules la page Équipes (services/myTeam.ts) et la salle du
// conseil (services/chat.ts) l'utilisent encore. Il disparaît quand elles passent sur l'API.

/** Rôles du faux back, par nom de jeu (le vrai back les sert sur GET /api/games). */
export const GAME_ROLES: Record<string, readonly string[]> = {
  Valorant: ['Duelliste', 'Initiateur', 'Contrôleur', 'Sentinelle', 'Flex'],
  'League of Legends': ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
  'Counter-Strike 2': ['Entry', 'AWPer', 'Lurker', 'Support', 'IGL'],
  'Overwatch 2': ['Tank', 'DPS', 'Soutien'],
}

const MOCK_TOURNAMENTS: Record<
  string,
  { state: TournamentState; game: string; eliminated?: boolean }
> = {
  t1: { state: 'cours', game: 'Valorant' },
  t2: { state: 'cours', game: 'League of Legends', eliminated: true },
  t3: { state: 'ouvertes', game: 'Counter-Strike 2' },
  t4: { state: 'closes', game: 'Overwatch 2' },
}

export const db = {
  myTeams: structuredClone(MY_TEAMS) as MyTeam[],
}

/** L'équipe telle que le joueur connecté la voit : les demandes ne sont visibles que du capitaine. */
export function teamView(team: MyTeam): MyTeam {
  const copy = structuredClone(team)
  return team.captainId === team.myMemberId ? copy : { ...copy, requests: [] }
}

export function findTournament(id: string) {
  const tournament = MOCK_TOURNAMENTS[id]
  if (!tournament) throw new ApiError(404, 'Tournoi introuvable.')
  return tournament
}
