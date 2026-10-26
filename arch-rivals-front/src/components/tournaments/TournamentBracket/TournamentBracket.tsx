import type { Team } from '../../../types/tournament'
import type { BracketMatch, BracketRound, MatchStatus } from '../../../utils/bracket'
import styles from './TournamentBracket.module.css'

type TournamentBracketProps = {
  rounds: BracketRound[]
  champion: Team | null
  /** Équipe du joueur connecté, encadrée d'or. */
  myTeam: Team | null
}

const STATUS_LABELS: Record<Exclude<MatchStatus, 'scheduled'>, string> = {
  waiting: 'EN ATTENTE DES ÉQUIPES',
  live: '● EN DIRECT',
  done: 'TERMINÉ',
  forfeit: 'FORFAIT',
}

function statusLabel({ status, time }: BracketMatch) {
  if (status === 'scheduled') return (time ?? 'À planifier').toUpperCase()
  return STATUS_LABELS[status]
}

export default function TournamentBracket({ rounds, champion, myTeam }: TournamentBracketProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.grid}>
        {rounds.map((round) => (
          <div key={round.label} className={styles.round} role="group" aria-label={round.label}>
            <span className={styles.label}>{round.label}</span>
            <div className={styles.matches}>
              {round.matches.map((match) => (
                <div key={match.key} className={styles.match}>
                  {match.rows.map((row, i) => (
                    <div
                      key={i}
                      className={[
                        styles.row,
                        styles[row.outcome],
                        row.team && row.team === myTeam && styles.mine,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span className={styles.name}>{row.team ?? '—'}</span>
                      <span className={styles.score}>{row.score}</span>
                    </div>
                  ))}
                  <span className={`${styles.status} ${styles[match.status]}`}>
                    {statusLabel(match)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className={styles.round}>
          <span className={styles.label}>CHAMPION</span>
          <div className={styles.championSlot}>
            <div className={styles.champion} aria-live="polite">
              {champion ?? 'À déterminer'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
