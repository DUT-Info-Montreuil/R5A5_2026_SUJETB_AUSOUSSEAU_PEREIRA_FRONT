import { Link } from 'react-router'
import type { MyTeam } from '../../../types/team'
import type { Tournament } from '../../../types/tournament'
import { bannerInitials, initials } from '../../../utils/initials'
import { missingPlayers } from '../../../utils/teams'
import { PLAYERS_PER_TEAM } from '../../../utils/tournaments'
import Lock from '../../icons/Lock'
import styles from './TeamSheet.module.css'

type TeamSheetProps = {
  team: MyTeam
  tournament: Tournament
}

export default function TeamSheet({ team, tournament }: TeamSheetProps) {
  // L'effectif ne bouge que tant que les inscriptions sont ouvertes.
  const open = tournament.state === 'ouvertes'
  const missing = missingPlayers(team)
  const closedTeam = team.visibility === 'closed'
  // « Clôture le 30 oct. » → « 30 oct ».
  const closingDate = tournament.closing?.replace(/^Clôture le /, '').replace(/\.$/, '')

  return (
    <section className={styles.sheet} aria-label={`Équipe ${team.name}`}>
      <div className={styles.head}>
        <div className={styles.shield} aria-hidden="true">
          {bannerInitials(team.name)}
        </div>
        <div className={styles.identity}>
          <h2 className={styles.name}>{team.name}</h2>
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

      <div className={closedTeam ? `${styles.visibility} ${styles.closedTeam}` : styles.visibility}>
        <span className={styles.visIcon}>
          <Lock open={!closedTeam} />
        </span>
        <span className={styles.visText}>
          <span className={styles.visLabel}>{closedTeam ? 'ÉQUIPE FERMÉE' : 'ÉQUIPE OUVERTE'}</span>
          <span className={styles.visHint}>
            {closedTeam
              ? 'Aucune demande possible : l’équipe n’apparaît plus parmi celles qui recrutent.'
              : 'Tout joueur sans équipe dans ce tournoi peut demander à rejoindre.'}
          </span>
        </span>
      </div>

      <div className={styles.roster}>
        <div className={styles.rosterHead}>
          <h3 className={styles.rosterTitle}>EFFECTIF</h3>
          <span className={styles.rosterCount}>
            {team.members.length} / {PLAYERS_PER_TEAM}
          </span>
        </div>
        <ul className={styles.members}>
          {team.members.map((member) => {
            const captain = member.id === team.captainId
            const me = member.id === team.myMemberId
            const classes = [styles.member, captain && styles.captainRow, me && styles.meRow]
              .filter(Boolean)
              .join(' ')
            return (
              <li key={member.id} className={classes}>
                <span className={styles.avatar} aria-hidden="true">
                  {initials(member.username)}
                </span>
                <span className={styles.memberText}>
                  <span className={styles.memberLine}>
                    <span className={styles.memberName}>{member.username}</span>
                    {captain && <span className={styles.captainTag}>CAPITAINE</span>}
                    {me && <span className={styles.meTag}>toi</span>}
                  </span>
                  <span className={styles.role}>{member.role}</span>
                </span>
              </li>
            )
          })}
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
    </section>
  )
}
