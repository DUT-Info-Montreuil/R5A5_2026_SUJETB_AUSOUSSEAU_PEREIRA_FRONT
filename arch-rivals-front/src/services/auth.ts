import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth'
import { api } from './api'

// Contrat du back (api-routes.md, http://localhost:3000/api en dev) :
//   POST /auth/login     { email, password }            → 200 { token, user }
//   POST /auth/register  { email, username, password }  → 201 { token, user }
//   GET  /auth/me        Authorization: Bearer <token>  → 200 { user }
// avec user = { id, username, email, isAdmin, createdAt }, jamais le mot de passe.
// Erreurs : 401 INVALID_CREDENTIALS, 409 EMAIL_TAKEN / USERNAME_TAKEN,
// 429 TOO_MANY_ATTEMPTS (header Retry-After), 400 VALIDATION_ERROR.
// Le mot de passe part en clair (HTTPS en prod) : le hachage bcrypt est fait côté back.

export const login = (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload)

export const register = (payload: RegisterPayload) =>
  api.post<AuthResponse>('/auth/register', payload)

export async function me(): Promise<User> {
  const { user } = await api.get<{ user: User }>('/auth/me')
  return user
}
