import type { Game } from '../types/game'
import { api } from './api'
import { listOf, type GameDto } from './dto'

// GET /api/games (public) → liste des jeux et de leurs rôles.
// La liste change rarement : une seule requête par session, partagée par tous les écrans.

let cache: Promise<Game[]> | null = null

const toGame = (dto: GameDto): Game => ({
  id: dto.id,
  name: dto.name,
  roles: (dto.roles ?? []).map((r) => ({ id: r.id, name: r.name })),
})

export function fetchGames(): Promise<Game[]> {
  cache ??= api
    .get<unknown>('/games')
    .then((data) => listOf<GameDto>(data, 'games').map(toGame))
    .catch((err: unknown) => {
      cache = null // on retentera au prochain appel
      throw err
    })
  return cache
}
