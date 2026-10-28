import styles from './Toast.module.css'

/** Zone annoncée aux lecteurs d'écran : elle reste dans le DOM, seul son contenu change. */
export default function Toast({ text }: { text: string | null }) {
  return (
    <div className={styles.region} role="status" aria-live="polite">
      {text && (
        <div className={styles.toast}>
          <span className={styles.mark} aria-hidden="true">
            ✦
          </span>
          {text}
        </div>
      )}
    </div>
  )
}
