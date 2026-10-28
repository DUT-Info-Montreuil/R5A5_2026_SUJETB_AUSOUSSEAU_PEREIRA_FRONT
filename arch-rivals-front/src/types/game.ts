export type GameRole = {
  id: number
  name: string
}

/** Jeu et rôles de jeu, gérés par l'administrateur (GET /api/games). */
export type Game = {
  id: number
  name: string
  roles: GameRole[]
}
