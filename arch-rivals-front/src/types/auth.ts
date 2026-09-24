export type LoginPayload = {
  username: string
  password: string
}

export type RegisterPayload = {
  email: string
  username: string
  password: string
}

/**
 * Utilisateur tel que renvoyé par le back (table users, colonnes en snake_case).
 * `password_hash` ne doit jamais sortir du back : il n'existe pas côté front.
 */
export type User = {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

export type AuthResponse = {
  user: User
  token: string
}

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'
