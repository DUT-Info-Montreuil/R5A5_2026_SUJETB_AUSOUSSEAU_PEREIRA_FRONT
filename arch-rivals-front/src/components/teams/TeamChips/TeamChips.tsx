import styles from './TeamChips.module.css'

export type TeamChip = {
  teamId: number
  teamName: string
  /** Tournoi de l'équipe, ou « Hors tournoi · jeu ». */
  context: string
  /** Messages non lus de l'équipe. */
  unread: number
}

type TeamChipsProps = {
  chips: readonly TeamChip[]
  selected: number
  onSelect: (teamId: number) => void
}

/** Une pastille par équipe du joueur (une par tournoi, plus ses équipes hors tournoi). */
export default function TeamChips({ chips, selected, onSelect }: TeamChipsProps) {
  return (
    <div className={styles.chips} role="group" aria-label="Mes équipes">
      {chips.map((chip) => {
        const on = chip.teamId === selected
        const unread = on ? 0 : chip.unread
        return (
          <button
            key={chip.teamId}
            type="button"
            className={on ? `${styles.chip} ${styles.on}` : styles.chip}
            aria-pressed={on}
            onClick={() => onSelect(chip.teamId)}
          >
            <span className={styles.line}>
              <span className={styles.team}>{chip.teamName}</span>
              {unread > 0 && (
                <span className={styles.unread}>
                  {unread}
                  <span className="sr-only">
                    {' '}
                    message{unread > 1 ? 's' : ''} non lu{unread > 1 ? 's' : ''}
                  </span>
                </span>
              )}
            </span>
            <span className={styles.tournament}>{chip.context}</span>
          </button>
        )
      })}
    </div>
  )
}
