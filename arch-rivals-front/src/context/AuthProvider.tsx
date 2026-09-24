import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, setAuthToken } from '../services/api'
import * as authApi from '../services/auth'
import { tokenStorage } from '../services/tokenStorage'
import type { AuthStatus, LoginPayload, RegisterPayload, User } from '../types/auth'
import { AuthContext, type AuthContextValue } from './authContext'

function applyToken(token: string | null) {
  setAuthToken(token)
  if (token) tokenStorage.set(token)
  else tokenStorage.clear()
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [initialToken] = useState(() => tokenStorage.get())
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(initialToken ? 'loading' : 'anonymous')

  // Au chargement : si un token est stocké, on restaure la session via GET /auth/me.
  useEffect(() => {
    if (!initialToken) return
    let cancelled = false
    setAuthToken(initialToken)

    authApi
      .me()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Token refusé → on l'oublie. Back injoignable → on garde le token pour la prochaine fois.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) applyToken(null)
        setStatus('anonymous')
      })

    return () => {
      cancelled = true
    }
  }, [initialToken])

  const login = useCallback(async (payload: LoginPayload) => {
    const { token, user } = await authApi.login(payload)
    applyToken(token)
    setUser(user)
    setStatus('authenticated')
  }, [])

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await authApi.register(payload)
      // Si l'inscription ne renvoie pas de token, on enchaîne sur une connexion classique.
      if (!res?.token || !res.user) {
        await login({ username: payload.username, password: payload.password })
        return
      }
      applyToken(res.token)
      setUser(res.user)
      setStatus('authenticated')
    },
    [login],
  )

  // Pas de route de déconnexion côté back pour l'instant : on oublie simplement le token.
  const logout = useCallback(() => {
    applyToken(null)
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
