import { useState } from 'react'
import { useRecruitingTeams } from '../../../hooks/useRecruitingTeams'
import type { JoinRequest } from '../../../types/tournament'
import { teamErrorMessage } from '../../../utils/teamErrors'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import styles from './RecruitingTeams.module.css'

type RecruitingTeamsProps = {
  tournamentId: string
  /** Demande déjà envoyée dans ce tournoi : les autres boutons sont bloqués. */
  request: JoinRequest | null
  onRequest: (teamId: string) => Promise<void>
}

export default function RecruitingTeams({
  tournamentId,
  request,
  onRequest,
}: RecruitingTeamsProps) {
  const { teams, status } = useRecruitingTeams(tournamentId)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function ask(teamId: string) {
    setPendingId(teamId)
    setError(null)
    try {
      await onRequest(teamId)
    } catch (err) {
      setError(teamErrorMessage(err))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className={styles.panel}>
      <span className={styles.title}>ÉQUIPES QUI RECRUTENT</span>

      {status === 'loading' && <p className={styles.note}>Chargement des équipes…</p>}
      {status === 'error' && (
        <p className={styles.error} role="alert">
          Impossible de charger les équipes.
        </p>
      )}
      {status === 'ready' && teams.length === 0 && (
        <p className={styles.note}>Aucune équipe ne recrute pour l'instant. Crée la tienne !</p>
      )}

      {teams.map((team) => {
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
                {team.memberCount} / {PLAYERS_PER_TEAM} joueurs
              </span>
            </span>
            <button
              type="button"
              className={className}
              onClick={() => ask(team.id)}
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
