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
}

export type BracketRound = {
  label: string
  matches: BracketMatch[]
}

const ROUND_LABELS = ['QUARTS', 'DEMIES', 'FINALE']

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
      }
    }),
  }))

  return { rounds: bracketRounds, champion }
}
