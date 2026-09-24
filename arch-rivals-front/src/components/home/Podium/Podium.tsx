import type { Podium as PodiumData } from '../../../types/tournament'
import Crown from '../../icons/Crown'
import styles from './Podium.module.css'

type PodiumProps = {
  podium: PodiumData
  animateCrown?: boolean
}

export default function Podium({ podium, animateCrown = true }: PodiumProps) {
  // Ordre visuel 2 / 1 / 3 ; la liste reste lisible dans l'ordre du DOM.
  const steps = [
    { place: 2, team: podium.second, variant: styles.second },
    { place: 1, team: podium.first, variant: styles.first },
    { place: 3, team: podium.third, variant: styles.third },
  ]

  return (
    <section id="classement" className={styles.section}>
      <h2 className={styles.title}>Deviens le meilleur</h2>

      <ol className={styles.podium}>
        {steps.map(({ place, team, variant }) => (
          <li key={place} className={`${styles.column} ${variant}`}>
            {place === 1 && <Crown animated={animateCrown} />}
            <span className={styles.team} title={team}>
              {team}
            </span>
            <div className={styles.step}>
              <span className="sr-only">{place}e place : </span>
              <span aria-hidden="true">{place}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className={styles.base} />
    </section>
  )
}
