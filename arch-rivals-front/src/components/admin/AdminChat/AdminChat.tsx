import { useTeamChatReader } from '../../../hooks/useTeamChatReader'
import type { TournamentTeam } from '../../../types/tournament'
import MessageList from '../../teams/TeamChat/MessageList'
import styles from '../../teams/TeamChat/TeamChat.module.css'

/**
 * Salle du conseil d'une équipe, en lecture seule pour l'administrateur : il la consulte même
 * quand l'équipe est éliminée (B-18). Il n'y écrit pas : il n'est pas membre de l'équipe.
 */
export default function AdminChat({ team }: { team: TournamentTeam }) {
  const { messages, status } = useTeamChatReader(team.id)

  return (
    <section className={styles.panel} aria-label={`Salle du conseil de ${team.name}`}>
      <div className={styles.head}>
        <h2 className={styles.title}>CONSEIL · {team.name.toUpperCase()}</h2>
        <span className={styles.status}>
          <span className={styles.dotLive} aria-hidden="true" />
          {team.isEliminated ? 'Équipe éliminée · lecture seule' : 'En direct · lecture seule'}
        </span>
      </div>
      <MessageList
        messages={messages}
        status={status}
        userId={null}
        emptyText="Aucun message dans ce conseil."
      />
    </section>
  )
}
