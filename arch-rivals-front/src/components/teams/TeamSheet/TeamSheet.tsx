import { Link } from 'react-router'
import { useJoinRequests } from '../../../hooks/useJoinRequests'
import type { TeamActions } from '../../../hooks/useMyTeams'
import type { Game } from '../../../types/game'
import type { Tournament, TournamentTeam } from '../../../types/tournament'
import { endWithDate } from '../../../utils/dates'
import { bannerInitials } from '../../../utils/initials'
import {
  isCaptain,
  membersWithoutRole,
  missingPlayers,
  registrableTournaments,
} from '../../../utils/teams'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import ConfirmAction from '../ConfirmAction/ConfirmAction'
import JoinRequests from '../JoinRequests/JoinRequests'
import JoinTournament from '../JoinTournament/JoinTournament'
import MemberRow from '../MemberRow/MemberRow'
import TeamNameEditor from '../TeamNameEditor/TeamNameEditor'
import VisibilitySwitch from '../VisibilitySwitch/VisibilitySwitch'
import styles from './TeamSheet.module.css'

type TeamSheetProps = {
  team: TournamentTeam
  /** null : équipe hors tournoi, son effectif reste modifiable. */
  tournament: Tournament | null
  /** Jeu de l'équipe : il fixe les rôles proposés. */
  game: Game
  /** Joueur connecté. */
  userId: number | null
  actions: TeamActions
  /** Tous les tournois chargés : une équipe hors tournoi choisit parmi eux où s'inscrire. */
  tournaments: readonly Tournament[]
}

export default function TeamSheet({
  team,
  tournament,
  game,
  userId,
  actions,
  tournaments,
}: TeamSheetProps) {
  // L'effectif ne bouge que tant que les inscriptions sont ouvertes (B-11), ou tant que
  // l'équipe n'est inscrite à aucun tournoi ; seul le capitaine y touche (B-10).
  const open = tournament === null || tournament.state === 'ouvertes'
  const captain = isCaptain(team, userId)
  const editable = captain && open
  const missing = missingPlayers(team)
  const noRole = membersWithoutRole(team)
  const alone = team.members.length === 1
  // L'objet `team` change à chaque relecture du tournoi : les demandes sont alors relues.
  const { requests, failed } = useJoinRequests(team.id, editable, team)

  return (
    <section className={styles.sheet} aria-label={`Équipe ${team.name}`}>
      <div className={styles.head}>
        <div className={styles.shield} aria-hidden="true">
          {bannerInitials(team.name)}
        </div>
        <div className={styles.identity}>
          <TeamNameEditor name={team.name} editable={editable} onRename={actions.rename} />
          {tournament ? (
            <Link to={`/joueur/tournois/${tournament.id}`} className={styles.tournament}>
              {tournament.name} · {tournament.game} →
            </Link>
          ) : (
            <span className={styles.tournament}>Hors tournoi · {game.name}</span>
          )}
        </div>
      </div>

      <div
        className={
          open ? `${styles.lock} ${styles.lockOpen}` : `${styles.lock} ${styles.lockClosed}`
        }
      >
        <span className={styles.lockTag}>
          {!tournament ? 'HORS TOURNOI' : open ? 'INSCRIPTIONS OUVERTES' : 'EFFECTIF FIGÉ'}
        </span>
        <span>
          {!tournament
            ? 'Pas encore inscrite à un tournoi : l’effectif reste modifiable.'
            : open && tournament.registrationClosesAt
              ? `Effectif modifiable jusqu’au ${endWithDate(tournament.registrationClosesAt)}`
              : open
                ? 'Effectif modifiable jusqu’à la clôture des inscriptions.'
                : 'Les inscriptions sont closes, plus aucun changement possible.'}
        </span>
      </div>

      {/* Au lancement, une équipe est incomplète s'il manque un joueur ou un rôle (B-04, B-08). */}
      {tournament && open && (missing > 0 || noRole > 0) && (
        <p className={styles.warning} role="status">
          {missing > 0 && `Il manque ${missing} joueur${missing > 1 ? 's' : ''}. `}
          {noRole > 0 && `${noRole} joueur${noRole > 1 ? 's' : ''} sans rôle. `}
          Une équipe incomplète au lancement du tournoi est déclarée forfait sur son premier match.
        </p>
      )}

      {open && (
        <VisibilitySwitch
          visibility={team.visibility}
          editable={editable}
          onChange={actions.setVisibility}
        />
      )}

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
              key={member.userId}
              member={member}
              isCaptain={member.isCaptain}
              isMe={member.userId === userId}
              editable={editable}
              roles={game.roles}
              onRoleChange={(roleId) => actions.setRole(member.userId, roleId)}
              onTransfer={() => actions.transferCaptaincy(member.userId)}
              onKick={() => actions.kick(member.userId)}
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

      {editable && failed && (
        <p className={styles.note} role="alert">
          Impossible de charger les demandes à rejoindre.
        </p>
      )}
      {editable && requests.length > 0 && (
        <JoinRequests
          requests={requests}
          full={missing === 0}
          onAccept={actions.accept}
          onRefuse={actions.reject}
        />
      )}

      {!tournament && (
        <JoinTournament
          tournaments={registrableTournaments(tournaments, team, game.id)}
          game={game.name}
          captain={captain}
          onRegister={actions.register}
        />
      )}

      {open && (
        <div className={styles.exits}>
          <ConfirmAction
            label="Quitter l'équipe"
            question={
              captain && !alone
                ? `Quitter ${team.name} ? Le membre arrivé le plus tôt deviendra capitaine.`
                : captain
                  ? `Tu es seul : quitter ${team.name} la supprime.`
                  : `Quitter ${team.name} ? Tu perdras l'accès au conseil.`
            }
            confirmLabel="Quitter"
            onConfirm={actions.leave}
          />
          {captain && (
            <ConfirmAction
              label="Supprimer l'équipe"
              question={`Supprimer ${team.name} ? Membres, demandes et messages seront effacés.`}
              confirmLabel="Supprimer"
              onConfirm={actions.remove}
            />
          )}
        </div>
      )}
    </section>
  )
}
