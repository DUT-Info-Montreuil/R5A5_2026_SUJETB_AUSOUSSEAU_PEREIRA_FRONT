import type { DirectoryEntry } from '../../../utils/teamDirectory'
import DirectoryCard from '../DirectoryCard/DirectoryCard'
import styles from './TeamDirectory.module.css'

type TeamDirectoryProps = {
  /** Équipes déjà filtrées par la recherche et le filtre « Qui recrutent ». */
  entries: readonly DirectoryEntry[]
  query: string
  onQueryChange: (query: string) => void
  recruitingOnly: boolean
  onRecruitingOnlyChange: (on: boolean) => void
  onManage: (entry: DirectoryEntry) => void
  onRequest: (entry: DirectoryEntry) => Promise<void>
}

/** Onglet « Toutes les équipes » : recherche, filtre et cartes d'équipes (B-06). */
export default function TeamDirectory({
  entries,
  query,
  onQueryChange,
  recruitingOnly,
  onRecruitingOnlyChange,
  onManage,
  onRequest,
}: TeamDirectoryProps) {
  const trimmed = query.trim()

  return (
    <>
      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Chercher une équipe, un tournoi, un jeu…"
          aria-label="Chercher une équipe, un tournoi, un jeu ou un capitaine"
        />
        <button
          type="button"
          className={recruitingOnly ? `${styles.filter} ${styles.filterOn}` : styles.filter}
          aria-pressed={recruitingOnly}
          onClick={() => onRecruitingOnlyChange(!recruitingOnly)}
        >
          <span className={styles.check} aria-hidden="true">
            {recruitingOnly ? '✓' : ''}
          </span>
          Qui recrutent
        </button>
      </div>

      <p className={styles.note} role="status">
        {entries.length} équipe{entries.length > 1 ? 's' : ''}
        {trimmed && ` pour « ${trimmed} »`}
      </p>

      {entries.length === 0 ? (
        <p className={styles.empty}>Aucune équipe ne correspond.</p>
      ) : (
        <div className={styles.grid}>
          {entries.map((entry) => (
            <DirectoryCard
              key={entry.team.id}
              entry={entry}
              onManage={() => onManage(entry)}
              onRequest={() => onRequest(entry)}
            />
          ))}
        </div>
      )}
    </>
  )
}
