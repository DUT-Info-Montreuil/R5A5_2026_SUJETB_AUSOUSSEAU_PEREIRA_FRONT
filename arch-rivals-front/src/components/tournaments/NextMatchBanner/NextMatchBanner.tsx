import { Link } from 'react-router'
import type { UpcomingMatch } from '../../../utils/bracket'
import styles from './NextMatchBanner.module.css'

/** Le back ne fournit pas d'horaire de match : le bandeau annonce l'adversaire et le tour. */
export default function NextMatchBanner({ tournament, match }: UpcomingMatch) {
  return (
    <section className={styles.banner} aria-label="Ton prochain match">
      <div className={styles.text}>
        <span className={styles.head}>
          <span className={styles.eyebrow}>TON PROCHAIN MATCH</span>
          <span className={styles.countdown}>À jouer</span>
        </span>
        <span className={styles.title}>
          {match.round} · {match.myTeam} contre {match.opponent}
        </span>
        <span className={styles.sub}>
          {tournament.name} · {tournament.game}
        </span>
      </div>
      <Link to={`/joueur/tournois/${tournament.id}`} className={styles.cta}>
        Voir l'arbre
      </Link>
    </section>
  )
}
