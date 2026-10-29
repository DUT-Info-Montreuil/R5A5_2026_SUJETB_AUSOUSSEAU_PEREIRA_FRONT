import { createContext } from 'react'
import type { FreeTeam } from '../types/team'
import type { MyJoinRequest, Tournament, TournamentTeam } from '../types/tournament'

export type TournamentsStatus = 'loading' | 'ready' | 'error'
export type Requests = Record<number, MyJoinRequest>

export type TournamentsContextValue = {
  tournaments: Tournament[]
  status: TournamentsStatus
  userId: number | null
  /** Demandes d'adhésion en attente du joueur, une par tournoi. */
  requests: Requests
  /** Demandes vers des équipes hors tournoi, par équipe. */
  freeRequests: Requests
  /** Mes équipes hors tournoi. */
  freeTeams: FreeTeam[]
  /** Équipes hors tournoi de tous les joueurs (« Toutes les équipes »). */
  publicFreeTeams: FreeTeam[]
  /** Relit tous les tournois (une seule requête à la fois). */
  reload: () => Promise<void>
  /** Relit un tournoi après une écriture ou un événement temps réel. */
  refresh: (tournamentId: number) => Promise<void>
  createTeam: (tournamentId: number, name: string) => Promise<void>
  /** Crée une équipe hors tournoi ; renvoie son identifiant. */
  createFreeTeam: (name: string, gameId: number) => Promise<number>
  /** Inscrit une de mes équipes hors tournoi à un tournoi. */
  registerTeam: (teamId: number, tournamentId: number) => Promise<void>
  /** `tournamentId` à null : demande vers une équipe hors tournoi. */
  requestToJoin: (tournamentId: number | null, team: TournamentTeam) => Promise<void>
  cancelRequest: (tournamentId: number) => Promise<void>
}

export const TournamentsContext = createContext<TournamentsContextValue | null>(null)
