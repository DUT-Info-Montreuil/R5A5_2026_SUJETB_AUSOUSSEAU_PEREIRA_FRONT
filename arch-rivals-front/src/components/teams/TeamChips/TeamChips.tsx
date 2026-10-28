import styles from './TeamChips.module.css'

export type TeamChip = {
  tournamentId: number
  teamName: string
  tournamentName: string
}

type TeamChipsProps = {
  chips: readonly TeamChip[]
  selected: number
  onSelect: (tournamentId: number) => void
}

/** Une pastille par équipe du joueur (une seule équipe par tournoi). */
export default function TeamChips({ chips, selected, onSelect }: TeamChipsProps) {
  return (
    <div className={styles.chips} role="group" aria-label="Mes équipes">
      {chips.map((chip) => {
        const on = chip.tournamentId === selected
        return (
          <button
            key={chip.tournamentId}
            type="button"
            className={on ? `${styles.chip} ${styles.on}` : styles.chip}
            aria-pressed={on}
            onClick={() => onSelect(chip.tournamentId)}
          >
            <span className={styles.team}>{chip.teamName}</span>
            <span className={styles.tournament}>{chip.tournamentName}</span>
          </button>
        )
      })}
    </div>
  )
}
