import type { BetPool, BettorPage, BetWeek, MyBet } from '../types/bet'
import { api } from './api'
import { listOf, type BetPoolDto, type BettorDto, type MyBetDto, type WalletDto } from './dto'
import { follow, listen } from './realtime'

// Paris en Écus (FRONT-ATTENDU.md du back, § 9, commits 8e1ed90 et 5c98255), pas d'argent réel :
//   GET    /me/wallet                         → { balance, nextIncomeAt }  (null au plafond de 100)
//   GET    /tournaments/:id/bets              → { matches: BetPoolDto[] }            (public)
//   GET    /tournaments/:id/bets/me           → { bets: MyBetDto[] }
//   POST   /matches/:id/bets { teamId, amount } → 201 { bet, balance }
//   DELETE /matches/:id/bets/me               → { balance }
//   GET    /tournaments/:id/bets/leaderboard  → { leaderboard: BettorDto[], pagination }  (public)
//   GET    /bets/leaderboard?week=            → { from, to, leaderboard, pagination }      (public)
//   Temps réel : bets:updated (salon du tournoi), wallet:updated (salon personnel).
// Refus : 403 ADMIN_CANNOT_BET, PLAYER_CANNOT_BET ; 409 BETS_CLOSED, ALREADY_BET, INSUFFICIENT_FUNDS.
// Un match sans horaire n'est pas ouvert aux paris ; ils ferment à son horaire (`closesAt`), que le
// front surveille lui-même : le back n'émet rien à ce moment-là.

/** Mise minimale acceptée par le back. */
export const BET_MIN = 10
export const LEADERBOARD_PAGE = 20

const toPool = (dto: BetPoolDto): BetPool => ({
  matchId: dto.matchId,
  open: dto.open,
  closesAt: dto.closesAt,
  pot: dto.pot,
  pools: dto.pools.map((p) => ({ teamId: p.teamId, total: p.total, bettors: p.bettors })),
})

const toBet = (dto: MyBetDto): MyBet => ({
  matchId: dto.matchId,
  teamId: dto.teamId,
  amount: dto.amount,
  status: dto.status,
  payout: dto.payout,
})

function toPage(data: unknown): BettorPage {
  const bettors = listOf<BettorDto>(data, 'leaderboard').map((b) => ({
    rank: b.rank,
    userId: b.user.id,
    username: b.user.username,
    net: b.net,
    bets: b.bets,
    won: b.won,
  }))
  const total = (data as { pagination?: { total?: number } }).pagination?.total ?? bettors.length
  return { bettors, total }
}

export async function fetchWallet(): Promise<WalletDto> {
  return api.get<WalletDto>('/me/wallet')
}

export async function fetchBetPools(tournamentId: number): Promise<BetPool[]> {
  const data = await api.get<unknown>(`/tournaments/${tournamentId}/bets`)
  return listOf<BetPoolDto>(data, 'matches').map(toPool)
}

export async function fetchMyBets(tournamentId: number): Promise<MyBet[]> {
  const data = await api.get<unknown>(`/tournaments/${tournamentId}/bets/me`)
  return listOf<MyBetDto>(data, 'bets').map(toBet)
}

export async function placeBet(matchId: number, teamId: number, amount: number): Promise<void> {
  await api.post(`/matches/${matchId}/bets`, { teamId, amount })
}

/** Annule mon pari (paris du match encore ouverts) : la mise est rendue. */
export async function cancelBet(matchId: number): Promise<void> {
  await api.delete(`/matches/${matchId}/bets/me`)
}

export async function fetchTournamentBettors(tournamentId: number, offset: number) {
  return toPage(
    await api.get<unknown>(
      `/tournaments/${tournamentId}/bets/leaderboard?limit=${LEADERBOARD_PAGE}&offset=${offset}`,
    ),
  )
}

export async function fetchWeeklyBettors(week: BetWeek, offset: number) {
  return toPage(
    await api.get<unknown>(
      `/bets/leaderboard?week=${week}&limit=${LEADERBOARD_PAGE}&offset=${offset}`,
    ),
  )
}

/** Cagnottes poussées par le back pour ce tournoi ; renvoie la fonction qui coupe l'écoute. */
export function subscribeToBets(tournamentId: number, onPools: (pools: BetPool[]) => void) {
  const off = listen('bets:updated', (payload) => {
    if (payload.tournamentId === tournamentId) onPools(payload.matches.map(toPool))
  })
  const leave = follow('tournament', tournamentId)
  return () => {
    off()
    leave()
  }
}

/** Solde modifié (pari posé, annulé ou réglé) ; renvoie la fonction qui coupe l'écoute. */
export function onWalletUpdated(onChange: () => void) {
  return listen('wallet:updated', () => onChange())
}
