import { useId, useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import controls from '../../teams/controls.module.css'
import admin from '../admin.module.css'

const NAME_MAX = 50
const ROLE_MAX = 32
const ROLES_MAX = 10

/** « Duelliste, Sentinelle, Contrôleur » → rôles nettoyés, sans doublon. */
const parseRoles = (text: string) => [
  ...new Set(
    text
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean),
  ),
]

function validate(name: string, roles: string[]) {
  if (!name) return 'Donne un nom au jeu.'
  if (!roles.length) return 'Indique au moins un rôle.'
  if (roles.length > ROLES_MAX) return `${ROLES_MAX} rôles au plus.`
  if (roles.some((r) => r.length > ROLE_MAX)) return `Un rôle fait ${ROLE_MAX} caractères au plus.`
  return null
}

/** Nouveau jeu et ses rôles : il devient proposé à la création des tournois et des équipes. */
export default function CreateGameForm({
  onCreate,
}: {
  onCreate: (name: string, roles: string[]) => Promise<void>
}) {
  const id = useId()
  const [name, setName] = useState('')
  const [roles, setRoles] = useState('')
  const [invalid, setInvalid] = useState<string | null>(null)
  const { pending, error, run } = useAsyncAction()

  async function submit(event: FormEvent) {
    event.preventDefault()
    const list = parseRoles(roles)
    const problem = validate(name.trim(), list)
    setInvalid(problem)
    if (problem) return
    if (await run(() => onCreate(name.trim(), list))) {
      setName('')
      setRoles('')
    }
  }

  const message = invalid ?? error

  return (
    <form className={admin.panel} onSubmit={submit} noValidate>
      <h2 className={admin.panelTitle}>NOUVEAU JEU</h2>
      <div className={admin.row}>
        <label className={`${admin.field} ${admin.fieldNarrow}`}>
          <span className={admin.label}>NOM</span>
          <input
            className={admin.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={NAME_MAX}
            placeholder="Rocket League"
            autoComplete="off"
          />
        </label>
        <label className={admin.field}>
          <span className={admin.label}>RÔLES, SÉPARÉS PAR DES VIRGULES</span>
          <input
            className={admin.input}
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
            placeholder="Attaquant, Défenseur, Gardien"
            autoComplete="off"
            aria-describedby={message ? `${id}-error` : undefined}
          />
        </label>
        <button type="submit" className={`${controls.btn} ${controls.primary}`} disabled={pending}>
          {pending ? 'Création…' : 'Créer le jeu'}
        </button>
      </div>
      {message && (
        <p id={`${id}-error`} className={controls.error} role="alert">
          {message}
        </p>
      )}
    </form>
  )
}
