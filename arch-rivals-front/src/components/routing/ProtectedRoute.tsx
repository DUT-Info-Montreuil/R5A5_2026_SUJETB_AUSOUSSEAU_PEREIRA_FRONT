import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

/**
 * Réserve une route aux joueurs connectés. Masque l'écran seulement :
 * c'est le back qui refuse réellement les données (401 / 403).
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()

  // Session en cours de restauration (GET /auth/me) : on attend avant de rediriger.
  if (status === 'loading') return <p className="sr-only">Chargement…</p>
  if (status === 'anonymous') return <Navigate to="/" replace />
  return children
}
