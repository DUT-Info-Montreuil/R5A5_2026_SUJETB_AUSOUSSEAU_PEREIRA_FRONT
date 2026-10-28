import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import { useTeamChat } from '../../../hooks/useTeamChat'
import { MESSAGE_MAX } from '../../../services/chat'
import { formatMessageTime } from '../../../utils/chatTime'
import controls from '../controls.module.css'
import styles from './TeamChat.module.css'

type TeamChatProps = {
  teamId: number
  /** Joueur connecté. */
  userId: number | null
  /** Équipe éliminée : l'espace est fermé (B-18). */
  eliminated: boolean
}

/** Salle du conseil : espace d'échange réservé aux membres de l'équipe (B-16). */
export default function TeamChat({ teamId, userId, eliminated }: TeamChatProps) {
  const inputId = useId()
  const { messages, status, send } = useTeamChat(teamId, eliminated)
  const closed = status === 'closed'
  const [draft, setDraft] = useState('')
  const { pending, error, run } = useAsyncAction()
  const listRef = useRef<HTMLDivElement>(null)

  // Synchronisation avec le DOM : on garde le dernier message visible.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || pending) return
    if (await run(() => send(draft))) setDraft('')
  }

  return (
    <section className={styles.panel} aria-label="Salle du conseil">
      <div className={styles.head}>
        <h2 className={styles.title}>SALLE DU CONSEIL</h2>
        <span className={styles.status}>
          <span className={closed ? styles.dotOff : styles.dotLive} aria-hidden="true" />
          {closed ? 'Fermée' : 'En direct · réservé à l’équipe'}
        </span>
      </div>

      {closed ? (
        <div className={styles.closed}>
          <span className={styles.closedTitle}>Les portes sont closes</span>
          <span className={styles.closedText}>
            Ton équipe a été éliminée : cet espace d'échange est fermé.
          </span>
        </div>
      ) : (
        <>
          <div ref={listRef} className={styles.messages} role="log" aria-live="polite">
            {status === 'loading' && <p className={styles.empty}>Ouverture des portes…</p>}
            {status === 'error' && (
              <p className={styles.empty} role="alert">
                Impossible de charger les messages.
              </p>
            )}
            {status === 'ready' && messages.length === 0 && (
              <p className={styles.empty}>
                Le conseil est silencieux. Lance la première discussion.
              </p>
            )}
            {messages.map((message) => {
              const mine = userId !== null && message.authorId === userId
              return (
                <div
                  key={message.id}
                  className={mine ? `${styles.msg} ${styles.mine}` : styles.msg}
                >
                  <span className={styles.meta}>
                    {mine ? 'Toi' : message.author} ·{' '}
                    <time dateTime={message.sentAt}>{formatMessageTime(message.sentAt)}</time>
                  </span>
                  <span className={styles.bubble}>{message.text}</span>
                </div>
              )
            })}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <label htmlFor={inputId} className="sr-only">
              Message à ton équipe
            </label>
            <input
              id={inputId}
              className={styles.input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Écrire à ton équipe…"
              maxLength={MESSAGE_MAX}
              autoComplete="off"
              disabled={status !== 'ready'}
            />
            <button
              type="submit"
              className={styles.send}
              disabled={status !== 'ready' || pending || !draft.trim()}
            >
              Envoyer
            </button>
            {error && (
              <p className={controls.error} role="alert">
                {error}
              </p>
            )}
          </form>
        </>
      )}
    </section>
  )
}
