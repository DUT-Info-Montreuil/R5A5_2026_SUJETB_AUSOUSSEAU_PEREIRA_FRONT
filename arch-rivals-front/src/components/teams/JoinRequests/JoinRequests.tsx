import { useAsyncAction } from '../../../hooks/useAsyncAction'
import type { IncomingRequest } from '../../../types/team'
import controls from '../controls.module.css'
import styles from './JoinRequests.module.css'

type JoinRequestsProps = {
  requests: readonly IncomingRequest[]
  /** Effectif au complet : plus personne ne peut être accepté. */
  full: boolean
  onAccept: (requestId: string) => Promise<void>
  onRefuse: (requestId: string) => Promise<void>
}

export default function JoinRequests({ requests, full, onAccept, onRefuse }: JoinRequestsProps) {
  const { pending, error, run } = useAsyncAction()

  return (
    <div className={styles.block}>
      <h3 className={styles.title}>DEMANDES À REJOINDRE</h3>
      <ul className={styles.list}>
        {requests.map((request) => (
          <li key={request.id} className={styles.request}>
            <span className={styles.who}>
              <span className={styles.name}>{request.username}</span>
              <span className={styles.note}>{request.note}</span>
            </span>
            <span className={styles.actions}>
              <button
                type="button"
                className={`${controls.btn} ${full ? '' : controls.primary}`}
                onClick={() => run(() => onAccept(request.id))}
                disabled={full || pending}
              >
                {full ? 'Équipe complète' : 'Accepter'}
              </button>
              <button
                type="button"
                className={controls.btn}
                onClick={() => run(() => onRefuse(request.id))}
                disabled={pending}
              >
                Refuser
              </button>
            </span>
          </li>
        ))}
      </ul>
      {error && (
        <p className={controls.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
