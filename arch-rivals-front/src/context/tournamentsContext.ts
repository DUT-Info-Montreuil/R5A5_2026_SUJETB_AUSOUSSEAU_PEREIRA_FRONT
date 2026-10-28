import { createContext } from 'react'
import type { MyJoinRequest, Tournament, TournamentTeam } from '../types/tournament'

export type TournamentsStatus = 'loading' | 'ready' | 'error'
export type Requests = Record<number, MyJoinRequest>

export type TournamentsContextValue = {
  tournaments: Tournament[]
  status: TournamentsStatus
  userId: number | null
  /** Demandes d'adhésion en attente du joueur, une par tournoi. */
  requests: Requests
  /** Relit tous les tournois (une seule requête à la fois). */
  reload: () => Promise<void>
  /** Relit un tournoi après une écriture ou un événement temps réel. */
  refresh: (tournamentId: number) => Promise<void>
  createTeam: (tournamentId: number, name: string) => Promise<void>
  requestToJoin: (tournamentId: number, team: TournamentTeam) => Promise<void>
  cancelRequest: (tournamentId: number) => Promise<void>
}

export const TournamentsContext = createContext<TournamentsContextValue | null>(null)
