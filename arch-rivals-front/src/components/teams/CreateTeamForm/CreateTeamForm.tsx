import { useId, useState, type FormEvent } from 'react'
import { teamErrorMessage } from '../../../utils/teamErrors'
import { TEAM_NAME_MAX, validateTeamName } from '../../../utils/validation'
import styles from './CreateTeamForm.module.css'

type CreateTeamFormProps = {
  onCreate: (name: string) => Promise<void>
  onCancel: () => void
}

export default function CreateTeamForm({ onCreate, onCancel }: CreateTeamFormProps) {
  const id = useId()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const invalid = validateTeamName(name)
    if (invalid) {
      setError(invalid)
      return
    }
    setPending(true)
    setError(null)
    try {
      await onCreate(name.trim())
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
          Tu en deviens le capitaine. Tu pourras le renommer tant que les inscriptions sont
          ouvertes.
        </p>
      )}
    </form>
  )
}
