// Formes JSON renvoyées par le back (contrat : api-routes.md du dépôt BACK).
//
// Le contrat fixe les routes, les droits et les conventions, mais pas le nom de chaque champ :
// ils sont déduits du schéma SQL du back (sql/schema.sqlite.sql) passé en camelCase, comme
// l'utilisateur ({ id, username, email, isAdmin, createdAt }). À vérifier sur /openapi.json :
// en cas d'écart, seuls ce fichier et mappers.ts changent.

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
