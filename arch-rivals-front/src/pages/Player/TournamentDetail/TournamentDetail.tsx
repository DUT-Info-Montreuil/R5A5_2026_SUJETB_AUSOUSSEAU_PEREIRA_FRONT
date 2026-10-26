import { Link, useParams } from 'react-router'
import StateBadge from '../../../components/tournaments/StateBadge/StateBadge'
import TournamentBracket from '../../../components/tournaments/TournamentBracket/TournamentBracket'
import { useTournament } from '../../../hooks/useTournament'
import { tournamentBracket } from '../../../utils/bracket'
import { TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import styles from './TournamentDetail.module.css'

export default function TournamentDetail() {
  const { id = '' } = useParams()
  const { tournament, status, live } = useTournament(id)

  const back = (
    <Link to="/joueur/tournois" className={styles.back}>
      ← TOUS LES TOURNOIS
    </Link>
  )

  if (status !== 'ready' || !tournament) {
    return (
      <>
        {back}
        <p className={styles.message} role={status === 'loading' ? undefined : 'alert'}>
          {status === 'loading' && 'Chargement du tournoi…'}
          {status === 'not-found' && 'Ce tournoi n’existe pas.'}
          {status === 'error' && 'Impossible de charger ce tournoi.'}
        </p>
      </>
    )
  }

  const bracket = tournamentBracket(tournament)

  return (
    <>
      {back}
      <div className={styles.head}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{tournament.name}</h1>
          <div className={styles.meta}>
            <StateBadge state={tournament.state} />
            <span>{tournament.game}</span>
            <span className={styles.sep} aria-hidden="true">
              ◆
            </span>
            <span>{tournament.date}</span>
          </div>
        </div>
        {live && (
          <span className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            EN DIRECT · MISE À JOUR AUTOMATIQUE
          </span>
        )}
      </div>

      {bracket ? (
        <>
          <TournamentBracket
            rounds={bracket.rounds}
            champion={bracket.champion}
            myTeam={tournament.myTeam?.name ?? null}
          />
          <p className={styles.note}>
            Ton équipe est encadrée d'or. Un match ne se joue qu'une fois ses deux équipes connues ;
            seuls les arbitres saisissent les résultats.
          </p>
        </>
      ) : (
        <div className={styles.waiting}>
          <p className={styles.waitingTitle}>L'arbre sera tiré à la clôture des inscriptions</p>
          <p className={styles.waitingText}>
            {tournament.registeredTeams} / {TEAMS_PER_TOURNAMENT} équipes engagées
            {tournament.closing && ` · ${tournament.closing}`}
          </p>
        </div>
      )}
    </>
  )
}
