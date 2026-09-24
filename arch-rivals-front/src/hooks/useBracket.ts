import { useCallback, useMemo, useState } from 'react'
import type { BracketSize, Side, Team } from '../types/tournament'

/** Clé "round-matchIndex" → côté vainqueur. */
export type Winners = Record<string, Side>

export type SlotStatus = 'winner' | 'loser' | 'pending'

export type Slot = {
  team: Team | null
  status: SlotStatus
  score: 'W' | 'L' | ''
}

export type Match = {
  key: string
  round: number
  index: number
  a: Slot
  b: Slot
  /** Faux tant que l'un des deux adversaires est inconnu. */
  playable: boolean
}

export type Round = {
  index: number
  matches: Match[]
}

const NO_WINNERS: Winners = {}

const matchKey = (round: number, index: number) => `${round}-${index}`

function slot(team: Team | null, side: Side, pick: Side | undefined): Slot {
  if (!pick) return { team, status: 'pending', score: '' }
  return pick === side
    ? { team, status: 'winner', score: 'W' }
    : { team, status: 'loser', score: 'L' }
}

/** Calcule les tours et le champion à partir des équipes et des résultats saisis. */
export function buildBracket(
  teams: readonly Team[],
  size: BracketSize,
  winners: Winners,
): { rounds: Round[]; champion: Team | null } {
  const roundCount = Math.log2(size)
  let entrants: (Team | null)[] = teams.slice(0, size)
  const rounds: Round[] = []

  for (let r = 0; r < roundCount; r++) {
    const matches: Match[] = []
    const next: (Team | null)[] = []

    for (let i = 0; i < entrants.length; i += 2) {
      const index = i / 2
      const key = matchKey(r, index)
      const a = entrants[i] ?? null
      const b = entrants[i + 1] ?? null
      const pick = winners[key]

      next.push(pick === 'a' ? a : pick === 'b' ? b : null)
      matches.push({
        key,
        round: r,
        index,
        a: slot(a, 'a', pick),
        b: slot(b, 'b', pick),
        playable: a !== null && b !== null,
      })
    }

    rounds.push({ index: r, matches })
    entrants = next
  }

  return { rounds, champion: entrants[0] ?? null }
}

/** Enregistre un vainqueur et efface tous les résultats des tours suivants. */
export function applyWinner(
  winners: Winners,
  round: number,
  index: number,
  side: Side,
): Winners {
  const next: Winners = { ...winners, [matchKey(round, index)]: side }
  for (const key of Object.keys(next)) {
    if (Number(key.split('-')[0]) > round) delete next[key]
  }
  return next
}

export function useBracket(teams: readonly Team[], bracketSize: BracketSize = 8) {
  // Les résultats sont liés à une taille : changer de taille repart d'un tableau vierge.
  const [state, setState] = useState<{ size: BracketSize; winners: Winners }>({
    size: bracketSize,
    winners: {},
  })
  const winners = state.size === bracketSize ? state.winners : NO_WINNERS

  const { rounds, champion } = useMemo(
    () => buildBracket(teams, bracketSize, winners),
    [teams, bracketSize, winners],
  )

  const selectWinner = useCallback(
    (round: number, index: number, side: Side) => {
      if (!rounds[round]?.matches[index]?.playable) return
      setState({ size: bracketSize, winners: applyWinner(winners, round, index, side) })
    },
    [rounds, bracketSize, winners],
  )

  const reset = useCallback(() => {
    setState({ size: bracketSize, winners: NO_WINNERS })
  }, [bracketSize])

  return { rounds, champion, selectWinner, reset }
}
