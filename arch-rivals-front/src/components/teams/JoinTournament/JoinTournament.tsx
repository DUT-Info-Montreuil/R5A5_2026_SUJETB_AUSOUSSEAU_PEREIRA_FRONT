import { useState } from 'react'
import type { Tournament } from '../../../types/tournament'
import { closingLabel } from '../../../utils/dates'
import { teamErrorMessage } from '../../../utils/teamErrors'
import { TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import styles from './JoinTournament.module.css'

type JoinTournamentProps = {
  /** Tournois où l'équipe peut s'inscrire (voir registrableTournaments). */
  tournaments: readonly Tournament[]
  game: string
  /** Seul le capitaine inscrit l'équipe. */
  captain: boolean
  onRegister: (tournament: Tournament) => Promise<void>
}

/** Tableau de bord d'une équipe hors tournoi : l'inscrire à un tournoi de son jeu. */
export default function JoinTournament({
  tournaments,
  game,
  captain,
  onRegister,
}: JoinTournamentProps) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function register(tournament: Tournament) {
    setPendingId(tournament.id)
    setError(null)
    try {
      await onRegister(tournament)
    } catch (err) {
      setError(teamErrorMessage(err))
      setPendingId(null)
    }
  }

  return (
    <div className={styles.block}>
      <h3 className={styles.title}>REJOINDRE UN TOURNOI</h3>
      {!captain && (
        <p className={styles.note}>Le capitaine peut inscrire l'équipe à un tournoi de {game}.</p>
      )}
      {captain && tournaments.length === 0 && (
        <p className={styles.note}>
          Aucun tournoi de {game} n'a d'inscriptions ouvertes pour l'instant.
        </p>
      )}
      {captain && tournaments.length > 0 && (
        <ul className={styles.list}>
          {tournaments.map((tournament) => (
            <li key={tournament.id} className={styles.tournament}>
              <span className={styles.info}>
                <span className={styles.name}>{tournament.name}</span>
                <span className={styles.meta}>
                  {tournament.teams.length} / {TEAMS_PER_TOURNAMENT} équipes
                  {tournament.registrationClosesAt &&
                    ` · ${closingLabel(tournament.registrationClosesAt)}`}
                </span>
              </span>
              <button
                type="button"
                className={styles.register}
                onClick={() => register(tournament)}
                disabled={pendingId !== null}
              >
                {pendingId === tournament.id ? 'Inscription…' : 'Inscrire l’équipe'}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {captain && (
        <p className={styles.note}>
          Une fois inscrite, l'équipe suit les règles du tournoi : effectif figé à la clôture.
        </p>
      )}
    </div>
  )
}
