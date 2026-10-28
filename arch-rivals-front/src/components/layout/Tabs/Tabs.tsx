import styles from './Tabs.module.css'

type TabItem<T extends string> = {
  id: T
  label: string
  count: number
}

type TabsProps<T extends string> = {
  tabs: readonly TabItem<T>[]
  /** null (pendant une recherche, par exemple) : aucun onglet n'est actif. */
  active: T | null
  onSelect: (id: T) => void
  /** Nom de la liste d'onglets pour les lecteurs d'écran. */
  label: string
}

/** Onglets avec compteur (tournois par état, mes équipes / toutes les équipes). */
export default function Tabs<T extends string>({ tabs, active, onSelect, label }: TabsProps<T>) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
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
