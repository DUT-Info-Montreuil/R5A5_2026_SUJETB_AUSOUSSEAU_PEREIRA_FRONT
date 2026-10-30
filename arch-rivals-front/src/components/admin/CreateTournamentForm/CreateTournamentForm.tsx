import { useId, useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import type { Game } from '../../../types/game'
import { fromDateTimeInput } from '../../../utils/dates'
import controls from '../../teams/controls.module.css'
import admin from '../admin.module.css'

const NAME_MIN = 3
const NAME_MAX = 100

type CreateTournamentFormProps = {
  games: readonly Game[]
  onCreate: (name: string, gameId: number, registrationClosesAt: string | null) => Promise<void>
  onCancel: () => void
}

/** Création d'un tournoi : les inscriptions sont ouvertes dès sa création (B-01). */
export default function CreateTournamentForm({
  games,
  onCreate,
  onCancel,
}: CreateTournamentFormProps) {
  const id = useId()
  const [name, setName] = useState('')
  const [gameId, setGameId] = useState<number | null>(games[0]?.id ?? null)
  const [closesAt, setClosesAt] = useState('')
  const [invalid, setInvalid] = useState<string | null>(null)
  const { pending, error, run } = useAsyncAction()

  function submit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    const problem =
      trimmed.length < NAME_MIN
        ? `Le nom doit faire au moins ${NAME_MIN} caractères.`
        : gameId === null
          ? 'Choisis le jeu du tournoi.'
          : null
    setInvalid(problem)
    if (problem || gameId === null) return
    run(() => onCreate(trimmed, gameId, fromDateTimeInput(closesAt)))
  }

  const message = invalid ?? error

  return (
    <form className={admin.panel} onSubmit={submit} noValidate>
      <h2 className={admin.panelTitle}>NOUVEAU TOURNOI</h2>
      <div className={admin.row}>
        <label className={admin.field}>
          <span className={admin.label}>NOM</span>
          <input
            className={admin.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="Coupe d'automne"
            autoComplete="off"
            autoFocus
            aria-invalid={invalid ? true : undefined}
            aria-describedby={message ? `${id}-error` : undefined}
          />
        </label>
        <label className={`${admin.field} ${admin.fieldNarrow}`}>
          <span className={admin.label}>JEU</span>
          <select
            className={admin.input}
            value={gameId ?? ''}
            onChange={(e) => setGameId(Number(e.target.value))}
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </label>
        <label className={`${admin.field} ${admin.fieldNarrow}`}>
          <span className={admin.label}>CLÔTURE PRÉVUE (FACULTATIF)</span>
          <input
            type="datetime-local"
            className={admin.input}
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
          />
        </label>
      </div>
      <div className={admin.row}>
        <button type="submit" className={`${controls.btn} ${controls.primary}`} disabled={pending}>
          {pending ? 'Création…' : 'Créer et ouvrir les inscriptions'}
        </button>
        <button type="button" className={controls.btn} onClick={onCancel} disabled={pending}>
          Annuler
        </button>
      </div>
      {message ? (
        <p id={`${id}-error`} className={controls.error} role="alert">
          {message}
        </p>
      ) : (
        <p className={admin.hint}>
          La date de clôture est indicative : c'est toi qui clos les inscriptions, une fois huit
          équipes engagées.
        </p>
      )}
    </form>
  )
}
