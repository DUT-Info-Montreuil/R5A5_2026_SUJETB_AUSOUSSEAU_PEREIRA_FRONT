import type { ToastTone } from '../../../context/toastContext'
import styles from './Toast.module.css'

/** Zone annoncée aux lecteurs d'écran : elle reste dans le DOM, seul son contenu change. */
export default function Toast({ text, tone }: { text: string | null; tone: ToastTone }) {
  const warning = tone === 'warning'
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {text && (
        <div className={warning ? `${styles.toast} ${styles.warning}` : styles.toast}>
          <span className={styles.mark} aria-hidden="true">
            {warning ? '⚠' : '✦'}
          </span>
          {text}
        </div>
      )}
    </div>
  )
}
