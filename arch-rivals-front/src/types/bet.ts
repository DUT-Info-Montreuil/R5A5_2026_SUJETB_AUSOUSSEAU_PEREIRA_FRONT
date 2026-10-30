/** Mises sur une équipe d'un match. */
export type TeamPool = { teamId: number; total: number; bettors: number }

/** Cagnotte d'un match : ouverte aux paris jusqu'à son horaire prévu ou à son résultat. */
export type BetPool = {
  matchId: number
  open: boolean
  closesAt: string | null
  pot: number
  pools: TeamPool[]
}

/** won / lost / refunded : match réglé, `payout` connu. */
export type MyBet = {
  matchId: number
  teamId: number
  amount: number
  status: 'pending' | 'won' | 'lost' | 'refunded'
  payout: number | null
}

export type Bettor = {
  rank: number
  userId: number
  username: string
  /** Gain net cumulé sur les paris réglés. */
  net: number
  bets: number
  won: number
}

export type BettorPage = { bettors: Bettor[]; total: number }

/** Semaine du classement global : la semaine en cours ou la précédente. */
export type BetWeek = 'current' | 'previous'
