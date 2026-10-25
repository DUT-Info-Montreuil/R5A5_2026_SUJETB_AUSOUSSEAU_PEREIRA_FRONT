import type { TournamentTab } from '../../../utils/tournaments'
import styles from './TournamentTabs.module.css'

type TabItem = {
  id: TournamentTab
  label: string
  count: number
}

type TournamentTabsProps = {
  tabs: readonly TabItem[]
  /** null pendant une recherche : aucun onglet n'est actif. */
  active: TournamentTab | null
  onSelect: (id: TournamentTab) => void
}

export default function TournamentTabs({ tabs, active, onSelect }: TournamentTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Tournois par état">
      {tabs.map(({ id, label, count }) => {
        const on = id === active
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={on}
            className={on ? `${styles.tab} ${styles.on}` : styles.tab}
            onClick={() => onSelect(id)}
          >
            {label}
            <span className={styles.count}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}
