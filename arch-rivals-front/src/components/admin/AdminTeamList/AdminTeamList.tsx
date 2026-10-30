import type { TournamentState, TournamentTeam } from '../../../types/tournament'
import { incompleteReason } from '../../../utils/admin'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import controls from '../../teams/controls.module.css'
import styles from './AdminTeamList.module.css'

type AdminTeamListProps = {
  teams: readonly TournamentTeam[]
  state: TournamentState
  /** Équipe dont la salle du conseil est ouverte. */
  selectedId: number | null
  onSelect: (teamId: number | null) => void
}

function teamStatus(team: TournamentTeam, state: TournamentState) {
  if (team.isEliminated) return 'Éliminée'
  const reason = incompleteReason(team)
  // Avant le lancement, une équipe incomplète sera forfait au premier match (B-04).
  if (reason && (state === 'ouvertes' || state === 'closes')) return `Incomplète : ${reason}`
  return state === 'termine' ? 'Championne' : 'En lice'
}

/** Équipes engagées : effectif, état, et accès à leur salle du conseil (B-18). */
export default function AdminTeamList({ teams, state, selectedId, onSelect }: AdminTeamListProps) {
  if (!teams.length) return <p className={styles.empty}>Aucune équipe engagée pour l'instant.</p>

  return (
    <ul className={styles.list}>
      {teams.map((team) => {
        const captain = team.members.find((m) => m.isCaptain)?.username ?? '—'
        const open = team.id === selectedId
        return (
          <li key={team.id} className={open ? `${styles.item} ${styles.open}` : styles.item}>
            <span className={styles.main}>
              <span className={styles.name}>{team.name}</span>
              <span className={styles.meta}>
                ♛ {captain} · {team.members.length} / {PLAYERS_PER_TEAM} · {teamStatus(team, state)}
              </span>
            </span>
            <button
              type="button"
              className={`${controls.btn} ${controls.gold}`}
              aria-pressed={open}
              onClick={() => onSelect(open ? null : team.id)}
            >
              {open ? 'Fermer le conseil' : 'Lire le conseil'}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
