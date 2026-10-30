import { useEffect, useRef } from 'react'
import { useTeamChatReader } from '../../../hooks/useTeamChatReader'
import type { TournamentTeam } from '../../../types/tournament'
import { formatMessageTime } from '../../../utils/chatTime'
import styles from '../../teams/TeamChat/TeamChat.module.css'

/**
 * Salle du conseil d'une équipe, en lecture seule pour l'administrateur : il la consulte même
 * quand l'équipe est éliminée (B-18). Il n'y écrit pas : il n'est pas membre de l'équipe.
 */
export default function AdminChat({ team }: { team: TournamentTeam }) {
  const { messages, status } = useTeamChatReader(team.id)
  const listRef = useRef<HTMLDivElement>(null)

  // Synchronisation avec le DOM : on garde le dernier message visible.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length])

  return (
    <section className={styles.panel} aria-label={`Salle du conseil de ${team.name}`}>
      <div className={styles.head}>
        <h2 className={styles.title}>CONSEIL · {team.name.toUpperCase()}</h2>
        <span className={styles.status}>
          <span className={styles.dotLive} aria-hidden="true" />
          {team.isEliminated ? 'Équipe éliminée · lecture seule' : 'En direct · lecture seule'}
        </span>
      </div>
      <div ref={listRef} className={styles.messages} role="log" aria-live="polite">
        {status === 'loading' && <p className={styles.empty}>Ouverture des portes…</p>}
        {status === 'error' && (
          <p className={styles.empty} role="alert">
            Impossible de charger les messages.
          </p>
        )}
        {status === 'ready' && messages.length === 0 && (
          <p className={styles.empty}>Aucun message dans ce conseil.</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={styles.msg}>
            <span className={styles.meta}>
              {message.author} ·{' '}
              <time dateTime={message.sentAt}>{formatMessageTime(message.sentAt)}</time>
            </span>
            <span className={styles.bubble}>{message.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
