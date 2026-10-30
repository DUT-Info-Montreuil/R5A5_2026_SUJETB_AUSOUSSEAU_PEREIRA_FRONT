import { Link } from 'react-router'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>
        Rejoins <span className={styles.amp}>&amp;</span> Gagne le tournoi
      </h1>
      <div className={styles.actions}>
        <Link to="/tournois" className={`${styles.cta} ${styles.primary}`}>
          Rejoindre
        </Link>
      </div>
    </section>
  )
}
