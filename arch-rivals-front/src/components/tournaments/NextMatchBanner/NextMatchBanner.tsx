import { Link } from 'react-router'
import { useNow } from '../../../hooks/useNow'
import type { UpcomingMatch } from '../../../utils/bracket'
import { countdownLabel, matchTimeLabel } from '../../../utils/dates'
import styles from './NextMatchBanner.module.css'

/** Prochain match : tour, adversaire, et horaire prévu avec compte à rebours s'il est fixé. */
export default function NextMatchBanner({ tournament, match }: UpcomingMatch) {
  const now = useNow()
  const { scheduledAt } = match
  const countdown = scheduledAt ? (countdownLabel(scheduledAt, now) ?? 'À jouer') : 'À jouer'

  return (
    <section className={styles.banner} aria-label="Ton prochain match">
      <div className={styles.text}>
        <span className={styles.head}>
          <span className={styles.eyebrow}>TON PROCHAIN MATCH</span>
          <span className={styles.countdown}>{countdown}</span>
        </span>
        <span className={styles.title}>
          {match.round}
          {scheduledAt && (
            <>
              {' · '}
              <time dateTime={scheduledAt}>{matchTimeLabel(scheduledAt, now)}</time>
            </>
          )}
        </span>
        <span className={styles.sub}>
          {tournament.name} — {match.myTeam} contre {match.opponent} · {tournament.game}
        </span>
      </div>
      <Link to={`/joueur/tournois/${tournament.id}`} className={styles.cta}>
        Voir l'arbre
      </Link>
    </section>
  )
}
