import { createContext } from 'react'
import type { AuthStatus, LoginPayload, RegisterPayload, User } from '../types/auth'

export type AuthContextValue = {
  user: User | null
  status: AuthStatus
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
