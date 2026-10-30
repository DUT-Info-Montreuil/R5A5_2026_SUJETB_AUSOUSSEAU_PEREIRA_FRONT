import type { ReactNode } from 'react'
import { Link } from 'react-router'
import page from '../../../styles/listPage.module.css'
import type { Tournament } from '../../../types/tournament'
import { dateLabel, TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import StateBadge from '../StateBadge/StateBadge'

type TournamentRowProps = {
  tournament: Tournament
  /** Page du tournoi. */
  to: string
  /** Mention ajoutée avant la flèche (prochaine décision de l'administrateur…). */
  children?: ReactNode
}

/** Ligne cliquable d'une liste de tournois : nom, jeu, date, état, équipes engagées. */
export default function TournamentRow({ tournament: t, to, children }: TournamentRowProps) {
  return (
    <li>
      <Link to={to} className={page.row}>
        <span className={page.main}>
          <span className={page.name}>{t.name}</span>
          <span className={page.meta}>
            {t.game} · {dateLabel(t)}
          </span>
        </span>
        <StateBadge state={t.state} />
        {t.state !== 'termine' && (
          <span className={page.count}>
            {t.teams.length} / {TEAMS_PER_TOURNAMENT} équipes
          </span>
        )}
        {children}
        <span className={page.arrow} aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  )
}
