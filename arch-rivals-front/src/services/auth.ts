import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth'
import { api } from './api'

// Contrat supposé avec le back (Express, http://localhost:3000/api en dev) :
//   POST /auth/login     { username, password }         → { token, user }
//   POST /auth/register  { email, username, password }  → { token, user }  (ou juste { user })
//   GET  /auth/me        Authorization: Bearer <token>  → user  (ou { user })
// avec user = { id, username, email, is_admin, created_at } — jamais password_hash.
// Le mot de passe part en clair (HTTPS en prod) : le hachage bcrypt + salt est fait côté back.
// Si le back renvoie d'autres formes, c'est ici (et seulement ici) qu'il faut adapter.

export const login = (payload: LoginPayload) => api.post<AuthResponse>('/auth/login', payload)

export const register = (payload: RegisterPayload) =>
  api.post<Partial<AuthResponse>>('/auth/register', payload)

export async function me(): Promise<User> {
  const data = await api.get<User | { user: User }>('/auth/me')
  return 'user' in data ? data.user : data
}
