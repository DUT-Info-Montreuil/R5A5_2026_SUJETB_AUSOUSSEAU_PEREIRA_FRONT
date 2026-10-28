import { useId, useState } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import type { GameRole } from '../../../types/game'
import type { TeamMember } from '../../../types/tournament'
import { initials } from '../../../utils/initials'
import controls from '../controls.module.css'
import styles from './MemberRow.module.css'

type MemberRowProps = {
  member: TeamMember
  isCaptain: boolean
  isMe: boolean
  /** Capitaine et inscriptions ouvertes : rôles et actions modifiables. */
  editable: boolean
  roles: readonly GameRole[]
  onRoleChange: (roleId: number | null) => Promise<void>
  onTransfer: () => Promise<void>
  onKick: () => Promise<void>
}

type Pending = 'kick' | 'captain' | null

export default function MemberRow({
  member,
  isCaptain,
  isMe,
  editable,
  roles,
  onRoleChange,
  onTransfer,
  onKick,
}: MemberRowProps) {
  const roleId = useId()
  const [confirm, setConfirm] = useState<Pending>(null)
  const { pending, error, run } = useAsyncAction()
  const classes = [styles.member, isCaptain && styles.captainRow, isMe && styles.meRow]
    .filter(Boolean)
    .join(' ')
  // On ne s'exclut pas soi-même et on ne se passe pas le commandement.
  const showActions = editable && !isMe

  async function confirmAction() {
    const ok = await run(confirm === 'kick' ? onKick : onTransfer)
    if (ok) setConfirm(null)
  }

  return (
    <li className={classes}>
      <span className={styles.avatar} aria-hidden="true">
        {initials(member.username)}
      </span>
      <span className={styles.text}>
        <span className={styles.line}>
          <span className={styles.name}>{member.username}</span>
          {isCaptain && <span className={styles.captainTag}>CAPITAINE</span>}
          {isMe && <span className={styles.meTag}>toi</span>}
        </span>
        {editable ? (
          <>
            <label htmlFor={roleId} className="sr-only">
              Rôle de {member.username}
            </label>
            <select
              id={roleId}
              className={styles.select}
              value={member.role?.id ?? ''}
              onChange={(e) =>
                run(() => onRoleChange(e.target.value === '' ? null : Number(e.target.value)))
              }
              disabled={pending}
            >
              {/* Sans rôle, l'équipe compte comme incomplète au lancement (B-08). */}
              <option value="">Aucun rôle</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <span className={member.role ? styles.role : `${styles.role} ${styles.noRole}`}>
            {member.role?.name ?? 'Aucun rôle'}
          </span>
        )}
      </span>

      {showActions && !confirm && (
        <span className={styles.actions}>
          <button
            type="button"
            className={`${controls.btn} ${controls.gold}`}
            onClick={() => setConfirm('captain')}
          >
            Passer capitaine
          </button>
          <button
            type="button"
            className={`${controls.btn} ${controls.danger}`}
            onClick={() => setConfirm('kick')}
          >
            Exclure
          </button>
        </span>
      )}

      {showActions && confirm && (
        <div className={controls.confirm} role="group" aria-label="Confirmation">
          <span className={controls.confirmText}>
            {confirm === 'kick'
              ? `Exclure ${member.username} ? Il perdra aussitôt l’accès au conseil.`
              : `Transmettre le commandement à ${member.username} ? Tu ne pourras plus gérer l’équipe.`}
          </span>
          <button
            type="button"
            className={`${controls.btn} ${confirm === 'kick' ? controls.dangerFilled : controls.primary}`}
            onClick={confirmAction}
            disabled={pending}
          >
            {confirm === 'kick' ? 'Exclure' : 'Transmettre'}
          </button>
          <button
            type="button"
            className={controls.btn}
            onClick={() => setConfirm(null)}
            disabled={pending}
          >
            Annuler
          </button>
        </div>
      )}

      {error && (
        <p className={controls.error} role="alert">
          {error}
        </p>
      )}
    </li>
  )
}
