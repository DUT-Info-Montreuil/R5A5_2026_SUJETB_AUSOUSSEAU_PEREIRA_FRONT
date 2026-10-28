import { Link } from 'react-router'
import type { TeamActions } from '../../../hooks/useMyTeams'
import type { MyTeam } from '../../../types/team'
import type { Tournament } from '../../../types/tournament'
import { bannerInitials } from '../../../utils/initials'
import { isCaptain, missingPlayers } from '../../../utils/teams'
import { useGames } from '../../../hooks/useGames'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import JoinRequests from '../JoinRequests/JoinRequests'
import LeaveTeam from '../LeaveTeam/LeaveTeam'
import MemberRow from '../MemberRow/MemberRow'
import TeamNameEditor from '../TeamNameEditor/TeamNameEditor'
import VisibilitySwitch from '../VisibilitySwitch/VisibilitySwitch'
import styles from './TeamSheet.module.css'

type TeamSheetProps = {
  team: MyTeam
  tournament: Tournament
  actions: TeamActions
}

export default function TeamSheet({ team, tournament, actions }: TeamSheetProps) {
  // L'effectif ne bouge que tant que les inscriptions sont ouvertes (B-11),
  // et seul le capitaine y touche (B-10).
  const open = tournament.state === 'ouvertes'
  const captain = isCaptain(team)
  const editable = captain && open
  const missing = missingPlayers(team)
  // Rôles du jeu du tournoi, servis par le back (GET /api/games).
  const { games } = useGames()
  const roles = games.find((g) => g.name === tournament.game)?.roles.map((r) => r.name) ?? []
  // « Clôture le 30 oct. » → « 30 oct ».
  const closingDate = tournament.closing?.replace(/^Clôture le /, '').replace(/\.$/, '')

  return (
    <section className={styles.sheet} aria-label={`Équipe ${team.name}`}>
      <div className={styles.head}>
        <div className={styles.shield} aria-hidden="true">
          {bannerInitials(team.name)}
        </div>
        <div className={styles.identity}>
          <TeamNameEditor name={team.name} editable={editable} onRename={actions.rename} />
          <Link to={`/joueur/tournois/${tournament.id}`} className={styles.tournament}>
            {tournament.name} · {tournament.game} →
          </Link>
        </div>
      </div>

      <div
        className={
          open ? `${styles.lock} ${styles.lockOpen}` : `${styles.lock} ${styles.lockClosed}`
        }
      >
        <span className={styles.lockTag}>{open ? 'INSCRIPTIONS OUVERTES' : 'EFFECTIF FIGÉ'}</span>
        <span>
          {open
            ? closingDate
              ? `Effectif modifiable jusqu’au ${closingDate}.`
              : 'Effectif modifiable jusqu’à la clôture des inscriptions.'
            : 'Les inscriptions sont closes, plus aucun changement possible.'}
        </span>
      </div>

      {open && missing > 0 && (
        <p className={styles.warning} role="status">
          Il manque {missing} joueur{missing > 1 ? 's' : ''}. Une équipe incomplète au lancement du
          tournoi est déclarée forfait sur son premier match.
        </p>
      )}

      <VisibilitySwitch
        visibility={team.visibility}
        editable={editable}
        onChange={actions.setVisibility}
      />

      <div className={styles.roster}>
        <div className={styles.rosterHead}>
          <h3 className={styles.rosterTitle}>EFFECTIF</h3>
          <span className={styles.rosterCount}>
            {team.members.length} / {PLAYERS_PER_TEAM}
          </span>
        </div>
        <ul className={styles.members}>
          {team.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isCaptain={member.id === team.captainId}
              isMe={member.id === team.myMemberId}
              editable={editable}
              roles={roles}
              onRoleChange={(role) => actions.setRole(member.id, role)}
              onTransfer={() => actions.transferCaptain(member.id)}
              onKick={() => actions.kick(member.id)}
            />
          ))}
          {Array.from({ length: missing }, (_, i) => (
            <li key={`libre-${i}`} className={styles.free}>
              <span className={styles.freeAvatar} aria-hidden="true">
                ?
              </span>
              Place libre
            </li>
          ))}
        </ul>
      </div>

      {editable && team.requests.length > 0 && (
        <JoinRequests
          requests={team.requests}
          full={missing === 0}
          onAccept={actions.accept}
          onRefuse={actions.refuse}
        />
      )}

      {open && !captain && <LeaveTeam teamName={team.name} onLeave={actions.leave} />}
      {open && captain && team.members.length > 1 && (
        <p className={styles.note}>
          Pour quitter l'équipe, passe d'abord le rôle de capitaine à un autre membre.
        </p>
      )}
    </section>
  )
}
