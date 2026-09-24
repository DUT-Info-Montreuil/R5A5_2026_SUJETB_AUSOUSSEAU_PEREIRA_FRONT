// Client HTTP minimal.
// L'URL de base vient de VITE_API_URL : « /api » en dev (.env.development, proxifié par Vite vers
// http://localhost:3000/api), à définir explicitement pour la prod.
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

/** status 0 = le serveur n'a pas pu être joint (back éteint, réseau…). */
export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

let authToken: string | null = null

/** Token envoyé en `Authorization: Bearer …` sur toutes les requêtes. */
export function setAuthToken(token: string | null) {
  authToken = token
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/** Récupère le message d'erreur renvoyé par le back ({ message } ou { error }), s'il y en a un. */
function serverMessage(data: unknown): string | null {
  if (typeof data === 'string') return data.trim() || null
  if (data && typeof data === 'object') {
    const { message, error } = data as { message?: unknown; error?: unknown }
    if (typeof message === 'string') return message
    if (typeof error === 'string') return error
  }
  return null
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE_URL) throw new ApiError(0, 'VITE_API_URL non définie.')

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body !== undefined && { 'Content-Type': 'application/json' }),
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(0, 'Serveur injoignable.')
  }

  const data = await parseBody(response)
  if (!response.ok) {
    throw new ApiError(
      response.status,
      serverMessage(data) ?? `${init.method ?? 'GET'} ${path} → ${response.status}`,
      data,
    )
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
