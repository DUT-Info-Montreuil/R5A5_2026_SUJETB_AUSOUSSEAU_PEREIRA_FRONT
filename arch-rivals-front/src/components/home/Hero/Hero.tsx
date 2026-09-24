import { scrollToId } from '../../../utils/scrollToId'
import styles from './Hero.module.css'

export default function Hero() {
  // TODO: brancher sur la route / l'appel API pour rejoindre un tournoi.
  const handleJoin = () => scrollToId('tournois')

  return (
    <section id="tournois" className={styles.hero}>
      <h1 className={styles.title}>
        Rejoins <span className={styles.amp}>&amp;</span> Gagne le tournoi
      </h1>
      <div className={styles.actions}>
        <button type="button" className={`${styles.cta} ${styles.primary}`} onClick={handleJoin}>
          Rejoindre
        </button>
      </div>
    </section>
  )
}
