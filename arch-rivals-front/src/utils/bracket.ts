import { buildBracket, type Winners } from '../hooks/useBracket'
import type { MatchResult, Side, Team, TournamentDetail } from '../types/tournament'
import { TEAMS_PER_TOURNAMENT } from './tournaments'

export type MatchStatus = 'waiting' | 'scheduled' | 'live' | 'done' | 'forfeit'

export type BracketRow = {
  team: Team | null
  score: string
  outcome: 'winner' | 'loser' | 'pending'
}

export type BracketMatch = {
  key: string
  rows: [BracketRow, BracketRow]
  status: MatchStatus
  /** Horaire prévu, uniquement pour un match programmé. */
  time: string | null
  /** Début prévu (ISO 8601), s'il est connu. */
  startsAt: string | null
}

export type BracketRound = {
  label: string
  matches: BracketMatch[]
}

const ROUND_LABELS = ['QUARTS', 'DEMIES', 'FINALE']
const ROUND_NAMES = ['Quart de finale', 'Demi-finale', 'Finale']

/** Côté vainqueur d'un résultat validé, null tant que le match n'est pas terminé. */
export function winnerSide(result: MatchResult | undefined): Side | null {
  if (result?.kind === 'forfeit') return result.forfeit === 'a' ? 'b' : 'a'
  if (result?.kind === 'done') return result.score[0] > result.score[1] ? 'a' : 'b'
  return null
}

function rowScore(result: MatchResult | undefined, side: Side): string {
  if (!result || result.kind === 'scheduled') return ''
  if (result.kind === 'forfeit') return result.forfeit === side ? 'F' : ''
  return String(result.score[side === 'a' ? 0 : 1])
}

function matchStatus(result: MatchResult | undefined, playable: boolean): MatchStatus {
  // Un match n'est jouable qu'une fois ses deux équipes connues.
  if (!playable) return 'waiting'
  if (!result || result.kind === 'scheduled') return 'scheduled'
  if (result.kind === 'forfeit') return 'forfeit'
  return result.kind
}

/** Construit l'arbre à afficher : seuls les résultats validés font avancer le gagnant. */
export function tournamentBracket(tournament: TournamentDetail) {
  const { teams, results } = tournament
  if (!teams) return null

  const winners: Winners = {}
  for (const [key, result] of Object.entries(results)) {
    const side = winnerSide(result)
    if (side) winners[key] = side
  }

  const { rounds, champion } = buildBracket(teams, TEAMS_PER_TOURNAMENT, winners)

  const bracketRounds: BracketRound[] = rounds.map((round) => ({
    label: ROUND_LABELS[round.index] ?? `TOUR ${round.index + 1}`,
    matches: round.matches.map((m) => {
      const result = m.playable ? results[m.key] : undefined
      return {
        key: m.key,
        rows: [
          { team: m.a.team, score: rowScore(result, 'a'), outcome: m.a.status },
          { team: m.b.team, score: rowScore(result, 'b'), outcome: m.b.status },
        ],
        status: matchStatus(result, m.playable),
        time: result?.kind === 'scheduled' ? result.time : null,
        startsAt: (result?.kind === 'scheduled' && result.startsAt) || null,
      }
    }),
  }))

  return { rounds: bracketRounds, champion }
}

export type NextMatch = {
  round: string
  opponent: Team
  live: boolean
  /** « En cours », l'horaire prévu, ou « À planifier ». */
  time: string
  startsAt: string | null
}

/** Où en est l'équipe du joueur : prochain match, élimination ou titre. */
export type PlayerProgress =
  | { kind: 'none' }
  | { kind: 'next'; match: NextMatch }
  | { kind: 'eliminated'; round: string }
  | { kind: 'champion' }

export function playerProgress(tournament: TournamentDetail): PlayerProgress {
  const me = tournament.myTeam?.name
  const bracket = tournamentBracket(tournament)
  if (!me || !bracket) return { kind: 'none' }
  if (bracket.champion === me) return { kind: 'champion' }

  for (const [roundIndex, round] of bracket.rounds.entries()) {
    for (const match of round.matches) {
      const side = match.rows.findIndex((row) => row.team === me)
      if (side === -1) continue
      const mine = match.rows[side]
      const roundName = ROUND_NAMES[roundIndex] ?? round.label

      if (mine.outcome === 'loser') return { kind: 'eliminated', round: roundName }
      if (mine.outcome === 'winner') continue

      // Match pas encore joué : il ne compte qu'une fois l'adversaire connu.
      const opponent = match.rows[1 - side].team
      if (!opponent) return { kind: 'none' }
      const live = match.status === 'live'
      return {
        kind: 'next',
        match: {
          round: roundName,
          opponent,
          live,
          time: live ? 'En cours' : (match.time ?? 'À planifier'),
          startsAt: match.startsAt,
        },
      }
    }
  }
  return { kind: 'none' }
}

export type UpcomingMatch = { tournament: TournamentDetail; match: NextMatch }

/** Le match à mettre en avant : un match en direct d'abord, puis le plus proche dans le temps. */
export function pickNextMatch(tournaments: readonly TournamentDetail[]): UpcomingMatch | null {
  const upcoming: UpcomingMatch[] = []
  for (const tournament of tournaments) {
    const progress = playerProgress(tournament)
    if (progress.kind === 'next') upcoming.push({ tournament, match: progress.match })
  }

  const rank = ({ match }: UpcomingMatch) =>
    match.live
      ? Number.MIN_SAFE_INTEGER
      : match.startsAt
        ? Date.parse(match.startsAt)
        : Number.MAX_SAFE_INTEGER
  return upcoming.toSorted((x, y) => rank(x) - rank(y))[0] ?? null
}
