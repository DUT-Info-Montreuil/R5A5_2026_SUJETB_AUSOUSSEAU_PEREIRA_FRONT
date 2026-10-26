import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import type { TournamentDetail } from '../../../types/tournament'
import { playerProgress, type PlayerProgress } from '../../../utils/bracket'
import { GAME_TAGS, TEAMS_PER_TOURNAMENT, TOURNAMENT_FORMAT } from '../../../utils/tournaments'
import StateBadge from '../StateBadge/StateBadge'
import styles from './TournamentCard.module.css'

type TournamentCardProps = {
  tournament: TournamentDetail
}

/** Ligne d'avancement du joueur dans un tournoi dont l'arbre est tiré. */
function progressLine(progress: PlayerProgress): string {
  switch (progress.kind) {
    case 'next':
      return `${progress.match.round} vs ${progress.match.opponent} · ${progress.match.time}`
    case 'eliminated':
      return `Éliminés en ${progress.round.toLowerCase()}`
    case 'champion':
      return 'Vainqueurs'
    case 'none':
      return ''
  }
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const { id, name, game, state, date, registeredTeams, closing, myTeam } = tournament
  const tag = GAME_TAGS[game]
  const open = state === 'ouvertes'
  // L'arbre n'existe qu'une fois les inscriptions closes.
  const detailLabel = open ? 'Détails' : 'Voir l’arbre'
  const detailPrimary = !myTeam && !open

  const myLine = myTeam
    ? `${myTeam.name} · ${myTeam.isCaptain ? 'Capitaine' : myTeam.role}`
    : 'Tu n’as pas encore d’équipe'
  const info = open
    ? `${registeredTeams} / ${TEAMS_PER_TOURNAMENT} équipes · ${closing}`
    : progressLine(playerProgress(tournament))
  const progress = {
    '--progress': `${(registeredTeams / TEAMS_PER_TOURNAMENT) * 100}%`,
  } as CSSProperties

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <div className={styles.main}>
          <div className={`${styles.game} ${styles[tag]}`} title={game} aria-hidden="true">
            {tag}
          </div>
          <div className={styles.details}>
            <div className={styles.titleRow}>
              <h2 className={styles.name}>{name}</h2>
              <StateBadge state={state} />
            </div>
            <div className={styles.meta}>
              <span>{game}</span>
              <span>
                <span className={styles.sep} aria-hidden="true">
                  ◆
                </span>
                {TOURNAMENT_FORMAT}
              </span>
              <span>
                <span className={styles.sep} aria-hidden="true">
                  ◆
                </span>
                {date}
              </span>
            </div>
            <div className={styles.meta}>
              <span className={myTeam ? styles.mine : styles.noTeam}>{myLine}</span>
              {info && <span className={styles.info}>{info}</span>}
            </div>
            {open && (
              <div
                className={styles.track}
                style={progress}
                role="progressbar"
                aria-label="Équipes engagées"
                aria-valuemin={0}
                aria-valuemax={TEAMS_PER_TOURNAMENT}
                aria-valuenow={registeredTeams}
              />
            )}
          </div>
        </div>
        <div className={styles.actions}>
          <Link
            to={`/joueur/tournois/${id}`}
            className={detailPrimary ? `${styles.action} ${styles.primary}` : styles.action}
          >
            {detailLabel}
          </Link>
        </div>
      </div>
    </article>
  )
}
