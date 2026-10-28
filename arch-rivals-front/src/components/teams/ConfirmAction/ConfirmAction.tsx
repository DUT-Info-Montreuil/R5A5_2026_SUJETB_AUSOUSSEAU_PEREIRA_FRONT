import { useState } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import controls from '../controls.module.css'
import styles from './ConfirmAction.module.css'

type ConfirmActionProps = {
  /** Bouton de départ, ex. « Quitter l'équipe ». */
  label: string
  /** Question posée avant d'agir, ex. « Quitter X ? Tu perdras l'accès au conseil. » */
  question: string
  /** Bouton de confirmation, ex. « Quitter ». */
  confirmLabel: string
  onConfirm: () => Promise<void>
}

/** Action destructrice confirmée sur place (quitter, supprimer l'équipe). */
export default function ConfirmAction({
  label,
  question,
  confirmLabel,
  onConfirm,
}: ConfirmActionProps) {
  const [confirming, setConfirming] = useState(false)
  const { pending, error, run } = useAsyncAction()

  if (!confirming) {
    return (
      <button
        type="button"
        className={`${controls.btn} ${controls.danger} ${styles.start}`}
        onClick={() => setConfirming(true)}
      >
        {label}
      </button>
    )
  }

  return (
    <div className={styles.confirm} role="group" aria-label="Confirmation">
      <span className={styles.text}>{question}</span>
      <button
        type="button"
        className={`${controls.btn} ${controls.dangerFilled}`}
        onClick={() => run(onConfirm)}
        disabled={pending}
      >
        {confirmLabel}
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
