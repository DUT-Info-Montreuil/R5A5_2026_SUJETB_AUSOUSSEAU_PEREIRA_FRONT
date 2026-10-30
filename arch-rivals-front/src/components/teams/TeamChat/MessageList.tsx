import { useEffect, useRef } from 'react'
import type { ChatMessage, ChatStatus } from '../../../types/chat'
import { formatMessageTime } from '../../../utils/chatTime'
import styles from './TeamChat.module.css'

type MessageListProps = {
  messages: readonly ChatMessage[]
  status: ChatStatus
  /** Lecteur : ses messages sont à droite, signés « Toi ». null pour l'administrateur. */
  userId: number | null
  /** Texte affiché quand le conseil n'a encore aucun message. */
  emptyText: string
}

/** Fil des messages d'une salle du conseil, du plus ancien au plus récent (B-16, B-18). */
export default function MessageList({ messages, status, userId, emptyText }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Synchronisation avec le DOM : on garde le dernier message visible.
  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length])

  return (
    <div ref={listRef} className={styles.messages} role="log" aria-live="polite">
      {status === 'loading' && <p className={styles.empty}>Ouverture des portes…</p>}
      {status === 'error' && (
        <p className={styles.empty} role="alert">
          Impossible de charger les messages.
        </p>
      )}
      {status === 'ready' && messages.length === 0 && <p className={styles.empty}>{emptyText}</p>}
      {messages.map((message) => {
        const mine = userId !== null && message.authorId === userId
        return (
          <div key={message.id} className={mine ? `${styles.msg} ${styles.mine}` : styles.msg}>
            <span className={styles.meta}>
              {mine ? 'Toi' : message.author} ·{' '}
              <time dateTime={message.sentAt}>{formatMessageTime(message.sentAt)}</time>
            </span>
            <span className={styles.bubble}>{message.text}</span>
          </div>
        )
      })}
    </div>
  )
}
