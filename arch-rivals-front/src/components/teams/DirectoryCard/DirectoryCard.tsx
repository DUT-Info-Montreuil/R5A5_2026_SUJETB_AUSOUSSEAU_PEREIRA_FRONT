import { useAsyncAction } from '../../../hooks/useAsyncAction'
import Lock from '../../icons/Lock'
import type { DirectoryAction, DirectoryBadge, DirectoryEntry } from '../../../utils/teamDirectory'
import { bannerInitials } from '../../../utils/initials'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import styles from './DirectoryCard.module.css'

const BADGES: Record<DirectoryBadge, string> = {
  recrute: 'RECRUTE',
  incomplete: 'INCOMPLÈTE',
  complete: 'COMPLÈTE',
  figee: 'FIGÉE',
}

const ACTIONS: Record<Exclude<DirectoryAction, null>, string> = {
  manage: 'Gérer mon équipe',
  join: 'Demander à rejoindre',
  private: 'Équipe fermée',
  sent: 'Demande envoyée',
  busy: 'Demande déjà en cours',
  engaged: 'Déjà engagé dans ce tournoi',
}

type DirectoryCardProps = {
  entry: DirectoryEntry
  onManage: () => void
  onRequest: () => Promise<void>
}

export default function DirectoryCard({ entry, onManage, onRequest }: DirectoryCardProps) {
  const { team, tournament, captain, mine, myRole, badge, action } = entry
  const { pending, error, run } = useAsyncAction()
  const primary = action === 'manage' || action === 'sent'
  const dim = action === 'busy' || action === 'engaged' || action === 'private'
  const closed = team.visibility === 'private'

  return (
    <article className={mine ? `${styles.card} ${styles.mine}` : styles.card}>
      {mine && (
        <div className={styles.banner}>
          <span>✦ TA BANNIÈRE</span>
          {myRole && <span className={styles.role}>{myRole}</span>}
        </div>
      )}
      <div className={styles.body}>
        <div className={styles.head}>
          <div className={styles.shield} aria-hidden="true">
            {bannerInitials(team.name)}
          </div>
          <div className={styles.identity}>
            <h3 className={styles.name}>{team.name}</h3>
            <span className={styles.tournament}>
              {tournament.name} · {tournament.game}
            </span>
          </div>
          <span
            className={closed ? `${styles.lock} ${styles.lockClosed}` : styles.lock}
            title={closed ? 'Équipe fermée' : 'Équipe ouverte'}
          >
            <Lock open={!closed} size={14} />
            <span className="sr-only">{closed ? 'Équipe fermée' : 'Équipe ouverte'}</span>
          </span>
        </div>

        <div className={styles.facts}>
          <span>
            Capitaine : <span className={styles.captain}>{captain ?? '—'}</span>
          </span>
          <span className={styles.status}>
            <span className={styles.count}>
              {team.members.length} / {PLAYERS_PER_TEAM}
            </span>
            <span className={`${styles.badge} ${styles[badge]}`}>{BADGES[badge]}</span>
          </span>
        </div>

        {action && (
          <button
            type="button"
            className={`${styles.action} ${primary ? styles.primary : dim ? styles.dim : ''}`}
            onClick={action === 'manage' ? onManage : () => run(onRequest)}
            disabled={(action !== 'manage' && action !== 'join') || pending}
          >
            {pending ? 'Envoi…' : ACTIONS[action]}
          </button>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  )
}
