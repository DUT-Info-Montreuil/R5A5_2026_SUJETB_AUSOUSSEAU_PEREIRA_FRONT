import { useState } from 'react'
import { ApiError } from '../../../services/api'
import type { Tournament, TournamentTeam } from '../../../types/tournament'
import { closingLabel } from '../../../utils/dates'
import { teamErrorMessage } from '../../../utils/teamErrors'
import { conflictText, registrationConflicts } from '../../../utils/teams'
import { TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import styles from './JoinTournament.module.css'

type JoinTournamentProps = {
  team: TournamentTeam
  /** Tournois où l'équipe peut s'inscrire (voir registrableTournaments). */
  tournaments: readonly Tournament[]
  game: string
  /** Seul le capitaine inscrit l'équipe. */
  captain: boolean
  onRegister: (tournament: Tournament) => Promise<void>
  /** Un membre joue déjà dans le tournoi avec une autre équipe : on prévient le capitaine. */
  onConflict: (message: string) => void
}

/** Tableau de bord d'une équipe hors tournoi : l'inscrire à un tournoi de son jeu. */
export default function JoinTournament({
  team,
  tournaments,
  game,
  captain,
  onRegister,
  onConflict,
}: JoinTournamentProps) {
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function register(tournament: Tournament) {
    setError(null)
    const conflicts = registrationConflicts(tournament, team)
    if (conflicts.length) {
      onConflict(`Inscription impossible à « ${tournament.name} » : ${conflictText(conflicts)}.`)
      return
    }
    setPendingId(tournament.id)
    try {
      await onRegister(tournament)
    } catch (err) {
      setError(teamErrorMessage(err))
      setPendingId(null)
      // Le tournoi a changé depuis son chargement : le back a vu le conflit avant nous.
      if (err instanceof ApiError && err.code === 'MEMBER_ALREADY_IN_TOURNAMENT')
        onConflict(`Inscription impossible à « ${tournament.name} » : ${err.message}`)
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
          {tournaments.map((tournament) => {
            const conflicts = registrationConflicts(tournament, team)
            return (
              <li
                key={tournament.id}
                className={
                  conflicts.length ? `${styles.tournament} ${styles.conflict}` : styles.tournament
                }
              >
                <span className={styles.info}>
                  <span className={styles.name}>{tournament.name}</span>
                  <span className={styles.meta}>
                    {tournament.teams.length} / {TEAMS_PER_TOURNAMENT} équipes
                    {tournament.registrationClosesAt &&
                      ` · ${closingLabel(tournament.registrationClosesAt)}`}
                  </span>
                  {conflicts.length > 0 && (
                    <span className={styles.warning}>⚠ Conflit : {conflictText(conflicts)}.</span>
                  )}
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
            )
          })}
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
