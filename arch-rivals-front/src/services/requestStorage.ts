import type { MyJoinRequest } from '../types/tournament'

// Le back n'a pas de route « mes demandes » : le front garde l'identifiant de la demande qu'il
// vient d'envoyer, pour l'afficher et pouvoir l'annuler (DELETE /api/join-requests/:id).
// Simple confort d'affichage : le back reste la seule vérité (une demande acceptée ou refusée
// disparaît dès que le tournoi montre le joueur dans une équipe, ou à l'annulation).

const key = (userId: number) => `arch-rivals.join-requests.${userId}`

// localStorage peut être indisponible (navigation privée stricte, stockage bloqué) : on ignore.
export const requestStorage = {
  load(userId: number): Record<number, MyJoinRequest> {
    try {
      return JSON.parse(localStorage.getItem(key(userId)) ?? '{}') as Record<number, MyJoinRequest>
    } catch {
      return {}
    }
  },
  save(userId: number, requests: Record<number, MyJoinRequest>) {
    try {
      localStorage.setItem(key(userId), JSON.stringify(requests))
    } catch {
      /* les demandes ne seront affichées que pendant cette visite */
    }
  },
}
