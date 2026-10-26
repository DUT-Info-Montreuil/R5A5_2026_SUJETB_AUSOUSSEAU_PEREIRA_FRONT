import type { TournamentState } from '../../../types/tournament'
import { STATE_LABELS } from '../../../utils/tournaments'
import styles from './StateBadge.module.css'

export default function StateBadge({ state }: { state: TournamentState }) {
  return <span className={`${styles.badge} ${styles[state]}`}>{STATE_LABELS[state]}</span>
}
