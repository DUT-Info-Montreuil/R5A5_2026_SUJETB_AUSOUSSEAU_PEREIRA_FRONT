import { useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import type { Match } from '../../../types/tournament'
import { bracketRow } from '../../../utils/bracket'
import { matchTimeLabel } from '../../../utils/dates'
import ConfirmAction from '../../teams/ConfirmAction/ConfirmAction'
import DateTimeForm from '../DateTimeForm/DateTimeForm'
import controls from '../../teams/controls.module.css'
import admin from '../admin.module.css'
import styles from './AdminMatchCard.module.css'

type AdminMatchCardProps = {
  match: Match
  /** Noms des équipes du tournoi, par identifiant. */
  names: ReadonlyMap<number, string>
  /** Tournoi en cours : seuls ses matchs jouables acceptent un résultat. */
  live: boolean
  onResult: (match: Match, scoreA: number, scoreB: number) => Promise<void>
  onForfeit: (match: Match, teamId: number) => Promise<void>
  onSchedule: (match: Match, scheduledAt: string | null) => Promise<void>
}

const STATUS_LABELS = { pending: 'En attente des équipes', ready: 'À jouer', finished: 'Terminé' }

/** Un match de l'arbre côté arbitre : résultat (B-13, B-14), forfait (B-15), horaire prévu. */
export default function AdminMatchCard({
  match,
  names,
  live,
  onResult,
  onForfeit,
  onSchedule,
}: AdminMatchCardProps) {
  const rows = [bracketRow(match, 'a', names), bracketRow(match, 'b', names)]
  const [teamA, teamB] = rows.map((r) => r.team ?? '—')
  const finished = match.status === 'finished'

  return (
    <article className={styles.card} aria-label={`${teamA} contre ${teamB}`}>
      <div className={styles.teams}>
        {rows.map((row, i) => (
          <div
            key={i}
            className={row.outcome === 'winner' ? `${styles.team} ${styles.winner}` : styles.team}
          >
            <span className={styles.name}>{row.team ?? '—'}</span>
            <span className={styles.score}>{row.score}</span>
          </div>
        ))}
      </div>

      <p className={styles.status}>
        {match.isForfeit ? 'Forfait' : STATUS_LABELS[match.status]}
        {!finished && match.scheduledAt && ` · ${matchTimeLabel(match.scheduledAt)}`}
      </p>

      {/* Jouable : ses deux équipes sont connues (B-14). */}
      {live && match.status === 'ready' && (
        <>
          <ResultForm teamA={teamA} teamB={teamB} onSubmit={(a, b) => onResult(match, a, b)} />
          <div className={styles.forfeits}>
            {rows.map(({ teamId, team }) => (
              <ConfirmAction
                key={teamId}
                label={`Forfait de ${team}`}
                question={`${team} déclare forfait : l'adversaire est qualifié.`}
                confirmLabel="Déclarer forfait"
                onConfirm={() => onForfeit(match, teamId!)}
              />
            ))}
          </div>
        </>
      )}

      {!finished && (
        <DateTimeForm
          key={match.scheduledAt ?? ''}
          label="HORAIRE PRÉVU"
          current={match.scheduledAt}
          onSave={(date) => onSchedule(match, date)}
        />
      )}
    </article>
  )
}

/** Score des deux équipes ; pas d'égalité (le back la refuse aussi, 422). */
function ResultForm({
  teamA,
  teamB,
  onSubmit,
}: {
  teamA: string
  teamB: string
  onSubmit: (scoreA: number, scoreB: number) => Promise<void>
}) {
  const [scoreA, setScoreA] = useState('')
  const [scoreB, setScoreB] = useState('')
  const [invalid, setInvalid] = useState<string | null>(null)
  const { pending, error, run } = useAsyncAction()

  function submit(event: FormEvent) {
    event.preventDefault()
    const problem = ![scoreA, scoreB].every((score) => /^\d+$/.test(score))
      ? 'Saisis deux scores entiers positifs.'
      : Number(scoreA) === Number(scoreB)
        ? 'Égalité impossible : il faut un vainqueur.'
        : null
    setInvalid(problem)
    if (!problem) run(() => onSubmit(Number(scoreA), Number(scoreB)))
  }

  const message = invalid ?? error

  return (
    <form className={admin.row} onSubmit={submit} noValidate>
      <label className={styles.scoreField}>
        <span className={admin.label}>{teamA}</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          className={admin.input}
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
        />
      </label>
      <label className={styles.scoreField}>
        <span className={admin.label}>{teamB}</span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          className={admin.input}
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
        />
      </label>
      <button type="submit" className={`${controls.btn} ${controls.primary}`} disabled={pending}>
        {pending ? 'Validation…' : 'Valider le résultat'}
      </button>
      {message && (
        <p className={controls.error} role="alert">
          {message}
        </p>
      )}
    </form>
  )
}
