import { createContext } from 'react'

export type NotificationsContextValue = {
  /** Messages non lus, par équipe. */
  unread: Record<number, number>
  /** Demandes en attente dans les équipes dont le joueur est capitaine. */
  pendingRequests: number
  /** Le joueur a la salle du conseil de cette équipe sous les yeux (null : aucune). */
  setActiveTeam: (teamId: number | null) => void
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null)
