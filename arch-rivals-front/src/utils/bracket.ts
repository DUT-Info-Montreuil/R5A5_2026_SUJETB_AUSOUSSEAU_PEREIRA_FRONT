import type { Match, Tournament } from '../types/tournament'
import { findMyTeam } from './tournaments'

// L'arbre est calculé par le back (tirage à la clôture, gagnant qui avance) : le front ne fait
// que mettre en forme les matchs de GET /api/tournaments/:id.

/** waiting : équipes pas encore connues ; ready : jouable ; done / forfeit : résultat validé. */
export type MatchView = 'waiting' | 'ready' | 'done' | 'forfeit'

export type BracketRow = {
  teamId: number | null
  team: string | null
  score: string
  outcome: 'winner' | 'loser' | 'pending'
}

export type BracketMatch = {
  key: number
  rows: [BracketRow, BracketRow]
  status: MatchView
  /** Horaire prévu d'un match pas encore joué. */
  scheduledAt: string | null
}

export type BracketRound = {
  label: string
  matches: BracketMatch[]
}

const ROUND_LABELS = ['QUARTS', 'DEMIES', 'FINALE']
const ROUND_NAMES = ['Quart de finale', 'Demi-finale', 'Finale']

export const roundName = (round: number) => ROUND_NAMES[round - 1] ?? `Tour ${round}`

function matchView(match: Match): MatchView {
  if (match.status === 'pending') return 'waiting'
  if (match.status === 'ready') return 'ready'
  return match.isForfeit ? 'forfeit' : 'done'
}

function row(match: Match, side: 'a' | 'b', names: Map<number, string>): BracketRow {
  const teamId = side === 'a' ? match.teamAId : match.teamBId
  const finished = match.status === 'finished'
  const outcome =
    !finished || teamId === null ? 'pending' : teamId === match.winnerId ? 'winner' : 'loser'
  const score = side === 'a' ? match.scoreA : match.scoreB
  return {
    teamId,
    team: teamId === null ? null : (names.get(teamId) ?? null),
    // Forfait : pas de score, un « F » pour l'équipe déclarée forfait.
    score: match.isForfeit ? (outcome === 'loser' ? 'F' : '') : score === null ? '' : String(score),
    outcome,
  }
}

const byRound = (a: Match, b: Match) => a.round - b.round || a.position - b.position

/** Arbre à afficher, ou null tant qu'il n'est pas tiré (inscriptions ouvertes). */
export function tournamentBracket(tournament: Tournament) {
  if (!tournament.matches.length) return null
  const names = new Map(tournament.teams.map((t) => [t.id, t.name]))
  const sorted = tournament.matches.toSorted(byRound)
  const roundNumbers = [...new Set(sorted.map((m) => m.round))]

  const rounds: BracketRound[] = roundNumbers.map((round) => ({
    label: ROUND_LABELS[round - 1] ?? `TOUR ${round}`,
    matches: sorted
      .filter((m) => m.round === round)
      .map((m) => ({
        key: m.id,
        rows: [row(m, 'a', names), row(m, 'b', names)],
        status: matchView(m),
        scheduledAt: m.status === 'finished' ? null : m.scheduledAt,
      })),
  }))

  const final = sorted.at(-1)
  const champion =
    final?.status === 'finished' && final.winnerId !== null
      ? (names.get(final.winnerId) ?? null)
      : null
  return { rounds, champion }
}

export type NextMatch = {
  round: string
  myTeam: string
  opponent: string
  scheduledAt: string | null
}

/** Où en est l'équipe du joueur : prochain match, élimination ou titre. */
export type PlayerProgress =
  | { kind: 'none' }
  | { kind: 'next'; match: NextMatch }
  /** Qualifiés, mais l'adversaire du tour suivant n'est pas encore connu. */
  | { kind: 'waiting'; round: string }
  | { kind: 'eliminated'; round: string }
  | { kind: 'champion' }

export function playerProgress(tournament: Tournament, userId: number | null): PlayerProgress {
  const mine = findMyTeam(tournament, userId)
  if (!mine || !tournament.matches.length) return { kind: 'none' }
  const names = new Map(tournament.teams.map((t) => [t.id, t.name]))
  const lastRound = Math.max(...tournament.matches.map((m) => m.round))

  for (const match of tournament.matches.toSorted(byRound)) {
    if (match.teamAId !== mine.id && match.teamBId !== mine.id) continue
    if (match.status === 'finished') {
      if (match.winnerId !== mine.id) return { kind: 'eliminated', round: roundName(match.round) }
      if (match.round === lastRound) return { kind: 'champion' }
      continue
    }
    // Un match n'est jouable qu'une fois ses deux équipes connues (B-14).
    if (match.status !== 'ready') return { kind: 'waiting', round: roundName(match.round) }
    const opponentId = match.teamAId === mine.id ? match.teamBId : match.teamAId
    return {
      kind: 'next',
      match: {
        round: roundName(match.round),
        myTeam: mine.name,
        opponent: (opponentId !== null && names.get(opponentId)) || '—',
        scheduledAt: match.scheduledAt,
      },
    }
  }
  return { kind: 'none' }
}

export type UpcomingMatch = { tournament: Tournament; match: NextMatch }

/** Le match à mettre en avant : le premier match jouable du joueur, tournois en cours d'abord. */
export function pickNextMatch(
  tournaments: readonly Tournament[],
  userId: number | null,
): UpcomingMatch | null {
  const ordered = tournaments.toSorted(
    (a, b) => Number(b.state === 'cours') - Number(a.state === 'cours'),
  )
  for (const tournament of ordered) {
    const progress = playerProgress(tournament, userId)
    if (progress.kind === 'next') return { tournament, match: progress.match }
  }
  return null
}
