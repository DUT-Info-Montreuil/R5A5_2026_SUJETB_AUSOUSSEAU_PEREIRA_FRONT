// Client HTTP minimal.
// L'URL de base vient de VITE_API_URL : « /api » en dev (.env.development, proxifié par Vite vers
// http://localhost:3000/api), à définir explicitement pour la prod.
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

/**
 * status 0 = le serveur n'a pas pu être joint (back éteint, réseau…).
 * code = code métier du back (« TEAM_FULL », « INVALID_CREDENTIALS »…), s'il y en a un.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly data: unknown
  /** Secondes à attendre avant de réessayer (header Retry-After des 429). */
  readonly retryAfter: number | null

  constructor(
    status: number,
    message: string,
    options: { code?: string | null; data?: unknown; retryAfter?: number | null } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = options.code ?? null
    this.data = options.data
    this.retryAfter = options.retryAfter ?? null
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

/** Erreur au format du back : { error: { code, message } }. Les autres formes sont ignorées. */
function serverError(data: unknown): { code: string | null; message: string | null } {
  const error = (data as { error?: unknown } | undefined)?.error
  if (!error || typeof error !== 'object') return { code: null, message: null }
  const { code, message } = error as { code?: unknown; message?: unknown }
  return {
    code: typeof code === 'string' ? code : null,
    message: typeof message === 'string' ? message : null,
  }
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
    const { code, message } = serverError(data)
    const retryAfter = Number(response.headers.get('Retry-After'))
    throw new ApiError(
      response.status,
      message ?? `${init.method ?? 'GET'} ${path} → ${response.status}`,
      { code, data, retryAfter: Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null },
    )
  }
  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
