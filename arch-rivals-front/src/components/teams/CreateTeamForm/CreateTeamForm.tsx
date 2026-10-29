import { useId, useState, type FormEvent } from 'react'
import type { Game } from '../../../types/game'
import { teamErrorMessage } from '../../../utils/teamErrors'
import { TEAM_NAME_MAX, validateTeamName } from '../../../utils/validation'
import styles from './CreateTeamForm.module.css'

type CreateTeamFormProps = {
  /** `gameId` : jeu choisi, seulement pour une équipe hors tournoi (`games` fourni). */
  onCreate: (name: string, gameId: number | null) => Promise<void>
  onCancel: () => void
  /** Équipe hors tournoi : le joueur choisit le jeu, qui fixe les rôles et les tournois possibles. */
  games?: readonly Game[]
}

export default function CreateTeamForm({ onCreate, onCancel, games }: CreateTeamFormProps) {
  const id = useId()
  const [name, setName] = useState('')
  const [gameId, setGameId] = useState<number | null>(games?.[0]?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const invalid = validateTeamName(name)
    if (invalid) {
      setError(invalid)
      return
    }
    if (games && gameId === null) {
      setError('Choisis le jeu de l’équipe.')
      return
    }
    setPending(true)
    setError(null)
    try {
      await onCreate(name.trim(), games ? gameId : null)
    } catch (err) {
      setError(teamErrorMessage(err))
      setPending(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label htmlFor={id} className={styles.label}>
        LEVER UNE BANNIÈRE
      </label>
      <div className={styles.row}>
        <input
          id={id}
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de l'équipe"
          maxLength={TEAM_NAME_MAX}
          autoComplete="off"
          autoFocus
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
        />
        {games && (
          <select
            className={`${styles.input} ${styles.game}`}
            value={gameId ?? ''}
            onChange={(e) => setGameId(Number(e.target.value))}
            aria-label="Jeu de l'équipe"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        )}
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? 'Création…' : 'Créer'}
        </button>
        <button type="button" className={styles.cancel} onClick={onCancel} disabled={pending}>
          Annuler
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className={styles.hint}>
          {games
            ? 'Tu en deviens le capitaine. Tu pourras l’inscrire ensuite à un tournoi de ce jeu.'
            : 'Tu en deviens le capitaine. Tu pourras le renommer tant que les inscriptions sont ouvertes.'}
        </p>
      )}
    </form>
  )
}
