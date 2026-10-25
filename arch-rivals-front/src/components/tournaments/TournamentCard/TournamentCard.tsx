import type { CSSProperties } from 'react'
import type { Tournament } from '../../../types/tournament'
import {
  GAME_TAGS,
  STATE_LABELS,
  TEAMS_PER_TOURNAMENT,
  TOURNAMENT_FORMAT,
} from '../../../utils/tournaments'
import styles from './TournamentCard.module.css'

type TournamentCardProps = {
  tournament: Tournament
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const { name, game, state, date, registeredTeams, closing, myTeam } = tournament
  const tag = GAME_TAGS[game]
  const open = state === 'ouvertes'

  const myLine = myTeam
    ? `${myTeam.name} · ${myTeam.isCaptain ? 'Capitaine' : myTeam.role}`
    : 'Tu n’as pas encore d’équipe'
  const info = open ? `${registeredTeams} / ${TEAMS_PER_TOURNAMENT} équipes · ${closing}` : ''
  const progress = { '--progress': `${(registeredTeams / TEAMS_PER_TOURNAMENT) * 100}%` } as CSSProperties

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <div className={`${styles.game} ${styles[tag]}`} title={game} aria-hidden="true">
          {tag}
        </div>
        <div className={styles.details}>
          <div className={styles.titleRow}>
            <h2 className={styles.name}>{name}</h2>
            <span className={`${styles.badge} ${styles[state]}`}>{STATE_LABELS[state]}</span>
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
    </article>
  )
}
