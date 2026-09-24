import type { CSSProperties } from 'react'
import { useBracket, type Slot } from '../../../hooks/useBracket'
import type { BracketSize, Side, Team } from '../../../types/tournament'
import styles from './Bracket.module.css'

type BracketProps = {
  teams: readonly Team[]
  bracketSize?: BracketSize
}

function roundLabel(round: number, roundCount: number) {
  const remaining = roundCount - round
  if (remaining === 1) return 'Finale'
  if (remaining === 2) return 'Demi-finales'
  if (remaining === 3) return 'Quarts de finale'
  return 'Huitièmes de finale'
}

export default function Bracket({ teams, bracketSize = 8 }: BracketProps) {
  const { rounds, champion, selectWinner, reset } = useBracket(teams, bracketSize)
  const hasResults = rounds.some((r) => r.matches.some((m) => m.a.status !== 'pending'))
  const gridStyle = { '--bracket-cols': rounds.length + 1 } as CSSProperties

  const renderSlot = (slot: Slot, side: Side, round: number, index: number, playable: boolean) => (
    <button
      type="button"
      className={`${styles.team} ${styles[slot.status]}`}
      onClick={() => selectWinner(round, index, side)}
      disabled={!playable}
      aria-pressed={slot.status === 'winner'}
      aria-label={slot.team ?? 'Équipe à déterminer'}
    >
      <span className={styles.name}>{slot.team ?? '—'}</span>
      <span className={styles.score} aria-hidden="true">
        {slot.score}
      </span>
    </button>
  )

  return (
    <section className={styles.section} aria-label="Tableau du tournoi">
      <div className={styles.frame}>
        <div className={styles.toolbar}>
          <button type="button" className={styles.reset} onClick={reset} disabled={!hasResults}>
            Réinitialiser
          </button>
          <span className={styles.label}>{bracketSize} ÉQUIPES · ÉLIMINATION DIRECTE</span>
        </div>

        <div className={styles.scroller}>
          <div className={styles.grid} style={gridStyle}>
            {rounds.map((round) => (
              <div
                key={round.index}
                className={styles.round}
                role="group"
                aria-label={roundLabel(round.index, rounds.length)}
              >
                {round.matches.map((m) => (
                  <div key={m.key} className={styles.match}>
                    {renderSlot(m.a, 'a', m.round, m.index, m.playable)}
                    {renderSlot(m.b, 'b', m.round, m.index, m.playable)}
                  </div>
                ))}
              </div>
            ))}

            <div className={styles.championCol}>
              <span className={styles.championLabel}>CHAMPION</span>
              <div className={styles.champion} aria-live="polite">
                {champion ?? 'À déterminer'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
