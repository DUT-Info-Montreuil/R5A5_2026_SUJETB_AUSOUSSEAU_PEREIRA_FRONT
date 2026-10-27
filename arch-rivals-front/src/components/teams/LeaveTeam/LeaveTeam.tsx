import { useState } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import controls from '../controls.module.css'
import styles from './LeaveTeam.module.css'

type LeaveTeamProps = {
  teamName: string
  onLeave: () => Promise<void>
}

/** Un joueur peut quitter son équipe tant que les inscriptions sont ouvertes (B-06). */
export default function LeaveTeam({ teamName, onLeave }: LeaveTeamProps) {
  const [confirming, setConfirming] = useState(false)
  const { pending, error, run } = useAsyncAction()

  if (!confirming) {
    return (
      <button
        type="button"
        className={`${controls.btn} ${controls.danger} ${styles.leave}`}
        onClick={() => setConfirming(true)}
      >
        Quitter l'équipe
      </button>
    )
  }

  return (
    <div className={styles.confirm} role="group" aria-label="Confirmation">
      <span className={styles.text}>Quitter {teamName} ? Tu perdras l'accès au conseil.</span>
      <button
        type="button"
        className={`${controls.btn} ${controls.dangerFilled}`}
        onClick={() => run(onLeave)}
        disabled={pending}
      >
        Quitter
      </button>
      <button
        type="button"
        className={controls.btn}
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Annuler
      </button>
      {error && (
        <p className={controls.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
