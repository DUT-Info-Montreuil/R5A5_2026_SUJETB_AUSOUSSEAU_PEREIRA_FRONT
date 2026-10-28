import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import type { MyJoinRequest, Tournament, TournamentTeam } from '../../../types/tournament'
import { playerProgress, type PlayerProgress } from '../../../utils/bracket'
import { gameTag } from '../../../utils/games'
import {
  canJoinOrCreate,
  dateLabel,
  findMyTeam,
  TEAMS_PER_TOURNAMENT,
  TOURNAMENT_FORMAT,
} from '../../../utils/tournaments'
import CreateTeamForm from '../../teams/CreateTeamForm/CreateTeamForm'
import RecruitingTeams from '../../teams/RecruitingTeams/RecruitingTeams'
import StateBadge from '../StateBadge/StateBadge'
import styles from './TournamentCard.module.css'

type TournamentCardProps = {
  tournament: Tournament
  /** Joueur connecté. */
  userId: number | null
  /** Demande en attente du joueur dans ce tournoi. */
  request: MyJoinRequest | null
  onCreateTeam: (tournamentId: number, name: string) => Promise<void>
  onRequestToJoin: (tournamentId: number, team: TournamentTeam) => Promise<void>
  onCancelRequest: (tournamentId: number) => Promise<void>
}

/** Panneau ouvert sous la carte (état d'interface, propre à la carte). */
type Panel = 'none' | 'create' | 'join'

/** Ligne d'avancement du joueur dans un tournoi dont l'arbre est tiré. */
function progressLine(progress: PlayerProgress): string {
  switch (progress.kind) {
    case 'next':
      return `${progress.match.round} vs ${progress.match.opponent} · à jouer`
    case 'waiting':
      return `${progress.round} · en attente de l'adversaire`
    case 'eliminated':
      return `Éliminés en ${progress.round.toLowerCase()}`
    case 'champion':
      return 'Vainqueurs'
    case 'none':
      return ''
  }
}

export default function TournamentCard({
  tournament,
  userId,
  request,
  onCreateTeam,
  onRequestToJoin,
  onCancelRequest,
}: TournamentCardProps) {
  const { id, name, game, state, teams } = tournament
  const [panel, setPanel] = useState<Panel>('none')
  const cancel = useAsyncAction()
  const myTeam = findMyTeam(tournament, userId)
  const me = myTeam?.members.find((m) => m.userId === userId)
  const canJoin = canJoinOrCreate(tournament, userId, request !== null)
  const tag = gameTag(game)
  const open = state === 'ouvertes'
  // L'arbre n'existe qu'une fois les inscriptions closes.
  const detailLabel = open ? 'Détails' : 'Voir l’arbre'
  const detailPrimary = !myTeam && !open

  const myLine = myTeam
    ? `${myTeam.name} · ${me?.isCaptain ? 'Capitaine' : (me?.role?.name ?? 'Sans rôle')}`
    : request
      ? `Demande envoyée à ${request.teamName}`
      : 'Tu n’as pas encore d’équipe'
  const myLineClass = myTeam ? styles.mine : request ? styles.requested : styles.noTeam
  const toggle = (next: Panel) => setPanel((current) => (current === next ? 'none' : next))
  const info = open
    ? `${teams.length} / ${TEAMS_PER_TOURNAMENT} équipes`
    : progressLine(playerProgress(tournament, userId))
  const progress = {
    '--progress': `${(teams.length / TEAMS_PER_TOURNAMENT) * 100}%`,
  } as CSSProperties

  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <div className={styles.main}>
          <div className={`${styles.game} ${styles[tag] ?? ''}`} title={game} aria-hidden="true">
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
                {dateLabel(tournament)}
              </span>
            </div>
            <div className={styles.meta}>
              <span className={myLineClass}>{myLine}</span>
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
                aria-valuenow={teams.length}
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
          {myTeam && state !== 'termine' && (
            <Link
              to={`/joueur/equipes?tournoi=${id}`}
              className={`${styles.action} ${styles.primary}`}
            >
              Mon équipe
            </Link>
          )}
          {request && open && !myTeam && (
            <button
              type="button"
              className={styles.action}
              onClick={() => cancel.run(() => onCancelRequest(id))}
              disabled={cancel.pending}
            >
              {cancel.pending ? 'Annulation…' : 'Annuler ma demande'}
            </button>
          )}
          {canJoin && (
            <>
              <button
                type="button"
                className={`${styles.action} ${styles.primary}`}
                onClick={() => toggle('create')}
                aria-expanded={panel === 'create'}
              >
                Créer une équipe
              </button>
              <button
                type="button"
                className={styles.action}
                onClick={() => toggle('join')}
                aria-expanded={panel === 'join'}
              >
                {panel === 'join' ? 'Fermer' : 'Rejoindre une équipe'}
              </button>
            </>
          )}
        </div>
      </div>
      {cancel.error && (
        <p className={styles.error} role="alert">
          {cancel.error}
        </p>
      )}
      {panel === 'create' && canJoin && (
        <CreateTeamForm
          onCreate={(teamName) => onCreateTeam(id, teamName)}
          onCancel={() => setPanel('none')}
        />
      )}
      {/* Après l'envoi, le panneau reste ouvert pour montrer la demande partie. */}
      {panel === 'join' && !myTeam && open && (
        <RecruitingTeams
          teams={teams}
          request={request}
          onRequest={(team) => onRequestToJoin(id, team)}
        />
      )}
    </article>
  )
}
