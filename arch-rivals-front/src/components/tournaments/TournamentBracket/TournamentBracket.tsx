import type { BracketRound, MatchView } from '../../../utils/bracket'
import { matchTimeLabel } from '../../../utils/dates'
import styles from './TournamentBracket.module.css'

type TournamentBracketProps = {
  rounds: BracketRound[]
  champion: string | null
  /** Équipe du joueur connecté, encadrée d'or. */
  myTeamId: number | null
}

const STATUS_LABELS: Record<MatchView, string> = {
  waiting: 'EN ATTENTE DES ÉQUIPES',
  ready: 'À JOUER',
  done: 'TERMINÉ',
  forfeit: 'FORFAIT',
}

export default function TournamentBracket({ rounds, champion, myTeamId }: TournamentBracketProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.grid}>
        {rounds.map((round) => (
          <div key={round.label} className={styles.round} role="group" aria-label={round.label}>
            <span className={styles.label}>{round.label}</span>
            <div className={styles.matches}>
              {round.matches.map((match) => (
                <div key={match.key} className={styles.match}>
                  {match.rows.map((row, i) => {
                    const mine = row.teamId !== null && row.teamId === myTeamId
                    return (
                      <div
                        key={i}
                        className={[styles.row, styles[row.outcome], mine && styles.mine]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {mine && <span className={styles.meTag}>TOI</span>}
                        <span className={styles.name}>{row.team ?? '—'}</span>
                        <span className={styles.score}>{row.score}</span>
                      </div>
                    )
                  })}
                  <span className={`${styles.status} ${styles[match.status]}`}>
                    {STATUS_LABELS[match.status]}
                    {match.scheduledAt && (
                      <time className={styles.time} dateTime={match.scheduledAt}>
                        {' · '}
                        {matchTimeLabel(match.scheduledAt)}
                      </time>
                    )}
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
