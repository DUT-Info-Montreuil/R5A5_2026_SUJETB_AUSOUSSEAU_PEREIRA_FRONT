import { Link } from 'react-router'
import { useNow } from '../../../hooks/useNow'
import type { UpcomingMatch } from '../../../utils/bracket'
import { countdownLabel } from '../../../utils/countdown'
import styles from './NextMatchBanner.module.css'

export default function NextMatchBanner({ tournament, match }: UpcomingMatch) {
  // L'horloge vit ici : seul le bandeau se re-rend chaque minute.
  const now = useNow()
  const countdown = countdownLabel(match, now)

  return (
    <section className={styles.banner} aria-label="Ton prochain match">
      <div className={styles.text}>
        <span className={styles.head}>
          <span className={styles.eyebrow}>TON PROCHAIN MATCH</span>
          {countdown && <span className={styles.countdown}>{countdown}</span>}
        </span>
        <span className={styles.title}>
          {match.round} · {match.time}
        </span>
        <span className={styles.sub}>
          {tournament.name} — {tournament.myTeam?.name} contre {match.opponent}
        </span>
      </div>
      <Link to={`/joueur/tournois/${tournament.id}`} className={styles.cta}>
        Voir l'arbre
      </Link>
    </section>
  )
}
