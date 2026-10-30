import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

type ProtectedRouteProps = {
  children: ReactNode
  /** Réservée à l'administrateur : un joueur est renvoyé vers son espace. */
  admin?: boolean
}

/**
 * Réserve une route aux joueurs connectés (ou à l'administrateur). Masque l'écran seulement :
 * c'est le back qui refuse réellement les données (401 / 403).
 */
export default function ProtectedRoute({ children, admin = false }: ProtectedRouteProps) {
  const { status, user } = useAuth()

  // Session en cours de restauration (GET /auth/me) : on attend avant de rediriger.
  if (status === 'loading') return <p className="sr-only">Chargement…</p>
  if (status === 'anonymous') return <Navigate to="/" replace />
  if (admin && !user?.isAdmin) return <Navigate to="/joueur" replace />
  return children
}
