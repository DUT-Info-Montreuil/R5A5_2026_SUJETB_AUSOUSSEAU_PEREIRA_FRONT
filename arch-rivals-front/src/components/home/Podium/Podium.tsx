import type { Podium as PodiumData } from '../../../types/tournament'
import Crown from '../../icons/Crown'
import styles from './Podium.module.css'

/** `podium` : undefined pendant le chargement, null sans tournoi terminé. */
export default function Podium({ podium }: { podium: PodiumData | null | undefined }) {
  // Ordre visuel 2 / 1 / 3 ; la liste reste lisible dans l'ordre du DOM.
  const steps = podium && [
    { place: 2, teams: [podium.second], variant: styles.second },
    { place: 1, teams: [podium.first], variant: styles.first },
    { place: 3, teams: podium.third, variant: styles.third },
  ]

  return (
    <section id="classement" className={styles.section}>
      <h2 className={styles.title}>Deviens le meilleur</h2>
      {podium === null && (
        <p className={styles.caption}>Le podium s'affichera à la fin du premier tournoi.</p>
      )}
      {podium && <p className={styles.caption}>Podium de « {podium.tournament} »</p>}

      {steps && (
        <ol className={styles.podium}>
          {steps.map(({ place, teams, variant }) => (
            <li key={place} className={`${styles.column} ${variant}`}>
              {place === 1 && <Crown />}
              <span className={styles.names}>
                {teams.map((team) => (
                  <span key={team} className={styles.team} title={team}>
                    {team}
                  </span>
                ))}
              </span>
              <div className={styles.step}>
                <span className="sr-only">{place === 1 ? '1re' : `${place}e`} place : </span>
                <span aria-hidden="true">{place}</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className={styles.base} />
    </section>
  )
}
