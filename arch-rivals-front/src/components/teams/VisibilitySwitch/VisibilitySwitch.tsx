import { useAsyncAction } from '../../../hooks/useAsyncAction'
import type { TeamVisibility } from '../../../types/team'
import Lock from '../../icons/Lock'
import controls from '../controls.module.css'
import styles from './VisibilitySwitch.module.css'

type VisibilitySwitchProps = {
  visibility: TeamVisibility
  /** Capitaine et inscriptions ouvertes : le cadenas devient un bouton. */
  editable: boolean
  onChange: (visibility: TeamVisibility) => Promise<void>
}

export default function VisibilitySwitch({
  visibility,
  editable,
  onChange,
}: VisibilitySwitchProps) {
  const { pending, error, run } = useAsyncAction()
  const closed = visibility === 'closed'
  const label = closed ? 'ÉQUIPE FERMÉE' : 'ÉQUIPE OUVERTE'
  const hint = closed
    ? 'Aucune demande possible : l’équipe n’apparaît plus parmi celles qui recrutent.'
    : 'Tout joueur sans équipe dans ce tournoi peut demander à rejoindre.'

  return (
    <div className={closed ? `${styles.row} ${styles.closed}` : styles.row}>
      {editable ? (
        <button
          type="button"
          className={`${styles.icon} ${styles.button}`}
          onClick={() => run(() => onChange(closed ? 'open' : 'closed'))}
          disabled={pending}
          aria-label={closed ? 'Ouvrir l’équipe aux demandes' : 'Fermer l’équipe aux demandes'}
          title={closed ? 'Ouvrir l’équipe' : 'Fermer l’équipe'}
        >
          <Lock open={!closed} />
        </button>
      ) : (
        <span className={styles.icon}>
          <Lock open={!closed} />
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.hint}>
          {hint}
          {editable && ` Clique sur le verrou pour ${closed ? 'ouvrir' : 'fermer'}.`}
        </span>
      </span>
      {error && (
        <p className={controls.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
