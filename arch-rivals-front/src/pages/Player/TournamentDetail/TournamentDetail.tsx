import { Link, useParams } from 'react-router'
import StateBadge from '../../../components/tournaments/StateBadge/StateBadge'
import TournamentBracket from '../../../components/tournaments/TournamentBracket/TournamentBracket'
import { useAuth } from '../../../hooks/useAuth'
import { useTournament } from '../../../hooks/useTournament'
import { tournamentBracket } from '../../../utils/bracket'
import { closingLabel } from '../../../utils/dates'
import { dateLabel, findMyTeam, TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import styles from './TournamentDetail.module.css'

type TournamentDetailProps = {
  /** Liste des tournois d'où l'on vient (espace joueur ou page publique). */
  backTo?: string
}

/** Détail d'un tournoi et son arbre, en direct (B-02, B-19) : joueurs et visiteurs. */
export default function TournamentDetail({ backTo = '/joueur/tournois' }: TournamentDetailProps) {
  const { id = '' } = useParams()
  const { user } = useAuth()
  // Identifiant mal formé (« /joueur/tournois/abc ») : traité comme un tournoi introuvable.
  const { tournament, status, live } = useTournament(Number(id) || 0)

  const back = (
    <Link to={backTo} className={styles.back}>
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
  const myTeamId = findMyTeam(tournament, user?.id ?? null)?.id ?? null

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
            <span>{dateLabel(tournament)}</span>
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
            myTeamId={myTeamId}
          />
          <p className={styles.note}>
            Le vainqueur de chaque match est sur fond doré
            {myTeamId !== null && ', ton équipe porte l’étiquette « TOI »'}. Un match ne se joue
            qu'une fois ses deux équipes connues ; seuls les arbitres saisissent les résultats.
          </p>
        </>
      ) : (
        <div className={styles.waiting}>
          <p className={styles.waitingTitle}>L'arbre sera tiré à la clôture des inscriptions</p>
          <p className={styles.waitingText}>
            {tournament.teams.length} / {TEAMS_PER_TOURNAMENT} équipes engagées
            {tournament.registrationClosesAt &&
              ` · ${closingLabel(tournament.registrationClosesAt)}`}
          </p>
        </div>
      )}
    </>
  )
}
