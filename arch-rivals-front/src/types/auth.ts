/** Le back identifie le compte par son email (POST /api/auth/login). */
export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

/**
 * Utilisateur public tel que renvoyé par le back (camelCase, voir api-routes.md du back).
 * Le hash du mot de passe ne sort jamais du back : il n'existe pas côté front.
 */
export type User = {
  id: number
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
}

export type AuthResponse = {
  user: User
  token: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'
