// Formes JSON renvoyées par le back, relevées sur son /openapi.json (dépôt BACK, commit eb70249).
// Les événements Socket.IO réutilisent les mêmes formes (src/realtime/socketIoNotifier.ts du back).
// Si le back change une réponse, seuls ce fichier et les fonctions de conversion des services changent.

/** Collection paginée : { "<liste>": [...], "pagination": { limit, offset, total } }. */
export type Page<K extends string, T> = { [key in K]: T[] } & {
  pagination: { limit: number; offset: number; total: number }
}

/** Extrait la liste d'une réponse, qu'elle soit paginée ({ games: [...] }) ou un tableau nu. */
export function listOf<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[]
  const list = (data as Record<string, unknown> | null)?.[key]
  return Array.isArray(list) ? (list as T[]) : []
}

export type GameRoleDto = {
  id: number
  name: string
}

/** GET /api/games */
export type GameDto = {
  id: number
  name: string
  roles: GameRoleDto[]
}
