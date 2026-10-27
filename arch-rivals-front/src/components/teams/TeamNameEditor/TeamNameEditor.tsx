import { useId, useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import { TEAM_NAME_MAX, validateTeamName } from '../../../utils/validation'
import controls from '../controls.module.css'
import styles from './TeamNameEditor.module.css'

type TeamNameEditorProps = {
  name: string
  /** Capitaine et inscriptions ouvertes : le nom peut changer. */
  editable: boolean
  onRename: (name: string) => Promise<void>
}

export default function TeamNameEditor({ name, editable, onRename }: TeamNameEditorProps) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const [invalid, setInvalid] = useState<string | null>(null)
  const { pending, error, run } = useAsyncAction()
  const message = invalid ?? error

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (draft === null) return
    const problem = validateTeamName(draft)
    setInvalid(problem)
    if (problem) return
    if (draft.trim() === name) {
      setDraft(null)
      return
    }
    if (await run(() => onRename(draft.trim()))) setDraft(null)
  }

  function cancel() {
    setDraft(null)
    setInvalid(null)
  }

  if (draft === null) {
    return (
      <div className={styles.view}>
        <h2 className={styles.name}>{name}</h2>
        {editable && (
          <button type="button" className={styles.rename} onClick={() => setDraft(name)}>
            Renommer
          </button>
        )}
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <label htmlFor={id} className="sr-only">
        Nouveau nom de l'équipe
      </label>
      <input
        id={id}
        className={styles.input}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && cancel()}
        maxLength={TEAM_NAME_MAX}
        autoComplete="off"
        autoFocus
        aria-invalid={message ? true : undefined}
        aria-describedby={message ? `${id}-error` : undefined}
      />
      <button type="submit" className={`${controls.btn} ${controls.primary}`} disabled={pending}>
        {pending ? 'Envoi…' : 'Valider'}
      </button>
      <button type="button" className={controls.btn} onClick={cancel} disabled={pending}>
        Annuler
      </button>
      {message && (
        <p id={`${id}-error`} className={controls.error} role="alert">
          {message}
        </p>
      )}
    </form>
  )
}
