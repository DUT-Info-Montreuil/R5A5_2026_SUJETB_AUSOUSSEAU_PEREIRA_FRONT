import { useState } from 'react'
import type { MyJoinRequest, TournamentTeam } from '../../../types/tournament'
import { teamErrorMessage } from '../../../utils/teamErrors'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import styles from './RecruitingTeams.module.css'

type RecruitingTeamsProps = {
  /** Équipes du tournoi : seules celles qui ont une place libre sont proposées. */
  teams: readonly TournamentTeam[]
  /** Demande déjà envoyée dans ce tournoi : les autres boutons sont bloqués. */
  request: MyJoinRequest | null
  onRequest: (team: TournamentTeam) => Promise<void>
}

export default function RecruitingTeams({ teams, request, onRequest }: RecruitingTeamsProps) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recruiting = teams.filter((t) => t.members.length < PLAYERS_PER_TEAM)

  async function ask(team: TournamentTeam) {
    setPendingId(team.id)
    setError(null)
    try {
      await onRequest(team)
    } catch (err) {
      setError(teamErrorMessage(err))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className={styles.panel}>
      <span className={styles.title}>ÉQUIPES QUI RECRUTENT</span>

      {recruiting.length === 0 && (
        <p className={styles.note}>Aucune équipe ne recrute pour l'instant. Crée la tienne !</p>
      )}

      {recruiting.map((team) => {
        const sentHere = request?.teamId === team.id
        const blocked = request !== null && !sentHere
        const className = sentHere
          ? `${styles.ask} ${styles.sent}`
          : blocked
            ? `${styles.ask} ${styles.blocked}`
            : styles.ask

        return (
          <div key={team.id} className={styles.team}>
            <span className={styles.info}>
              <span className={styles.name}>{team.name}</span>
              <span className={styles.count}>
                {team.members.length} / {PLAYERS_PER_TEAM} joueurs
              </span>
            </span>
            <button
              type="button"
              className={className}
              onClick={() => ask(team)}
              disabled={request !== null || pendingId !== null}
            >
              {sentHere
                ? 'Demande envoyée'
                : pendingId === team.id
                  ? 'Envoi…'
                  : 'Demander à rejoindre'}
            </button>
          </div>
        )
      })}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <span className={styles.note}>
        Une seule équipe par tournoi : une seule demande à la fois.
      </span>
    </div>
  )
}
