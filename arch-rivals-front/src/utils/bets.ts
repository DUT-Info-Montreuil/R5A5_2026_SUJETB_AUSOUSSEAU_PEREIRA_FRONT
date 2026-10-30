import type { User } from '../types/auth'
import type { BetPool, MyBet } from '../types/bet'
import type { Tournament } from '../types/tournament'
import { findMyTeam } from './tournaments'

// Pari mutuel (BACK-ATTENDU.md, § Paris) : les gagnants d'un match se partagent sa cagnotte au
// prorata de leurs mises ; personne sur le vainqueur, tout le monde est remboursé.

/** « 1 230 Écus » ; `signed` : « +70 Écus », « −50 Écus ». */
export function ecus(amount: number, signed = false) {
  const value = Math.abs(amount).toLocaleString('fr-FR')
  const sign = !signed || amount === 0 ? '' : amount > 0 ? '+' : '−'
  return `${sign}${value} Écu${Math.abs(amount) > 1 ? 's' : ''}`
}

const teamTotal = (pool: BetPool, teamId: number) =>
  pool.pools.find((p) => p.teamId === teamId)?.total ?? 0

/** Part de la cagnotte misée sur l'équipe, en pourcentage arrondi. */
export const share = (pool: BetPool, teamId: number) =>
  pool.pot ? Math.round((teamTotal(pool, teamId) / pool.pot) * 100) : 0

/** Cote actuelle (« ×2,40 ») : cagnotte / mises sur l'équipe ; null si personne ne l'a jouée. */
export function odds(pool: BetPool, teamId: number) {
  const total = teamTotal(pool, teamId)
  return total
    ? `×${(pool.pot / total).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`
    : null
}

/** Gain si l'équipe gagne et que personne d'autre ne mise d'ici là. */
export const estimatedPayout = (pool: BetPool, teamId: number, amount: number) =>
  Math.floor((amount * (pool.pot + amount)) / (teamTotal(pool, teamId) + amount))

/** Résultat d'un pari réglé, ou null tant qu'il est en cours. */
export function betOutcome(bet: MyBet) {
  if (bet.status === 'pending' || bet.payout === null) return null
  const net = bet.payout - bet.amount
  if (bet.status === 'refunded') return 'Remboursé'
  return `${bet.status === 'won' ? 'Gagné' : 'Perdu'} ${ecus(net, true)}`
}

/** Pourquoi l'utilisateur ne peut pas parier sur ce tournoi, ou null s'il le peut. */
export function betRefusal(user: User | null, tournament: Tournament) {
  if (!user) return 'anonymous'
  if (user.isAdmin) return 'admin'
  return findMyTeam(tournament, user.id) ? 'player' : null
}
