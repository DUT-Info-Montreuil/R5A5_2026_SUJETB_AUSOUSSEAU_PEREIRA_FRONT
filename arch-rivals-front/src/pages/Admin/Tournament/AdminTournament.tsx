import { Link, useParams, useSearchParams } from 'react-router'
import AdminChat from '../../../components/admin/AdminChat/AdminChat'
import AdminMatchCard from '../../../components/admin/AdminMatchCard/AdminMatchCard'
import AdminTeamList from '../../../components/admin/AdminTeamList/AdminTeamList'
import admin from '../../../components/admin/admin.module.css'
import TournamentControls from '../../../components/admin/TournamentControls/TournamentControls'
import StateBadge from '../../../components/tournaments/StateBadge/StateBadge'
import TournamentBracket from '../../../components/tournaments/TournamentBracket/TournamentBracket'
import { useToast } from '../../../hooks/useToast'
import { useTournament } from '../../../hooks/useTournament'
import {
  closeRegistrations,
  declareForfeit,
  recordResult,
  scheduleMatch,
  setRegistrationClosesAt,
  startTournament,
} from '../../../services/admin'
import type { Match } from '../../../types/tournament'
import { roundName, tournamentBracket } from '../../../utils/bracket'
import { dateLabel } from '../../../utils/tournaments'
import detail from '../../Player/TournamentDetail/TournamentDetail.module.css'
import styles from './AdminTournament.module.css'

export default function AdminTournament() {
  const { id = '' } = useParams()
  const { tournament, status, live, reload } = useTournament(Number(id) || 0)
  const toast = useToast()

  // Salle du conseil ouverte (`?conseil=<id d'équipe>`) : elle survit à F5 et se partage.
  const [params, setParams] = useSearchParams()
  const chatId = Number(params.get('conseil')) || null
  const selectChat = (teamId: number | null) =>
    setParams(teamId ? { conseil: String(teamId) } : {}, { replace: true })

  const back = (
    <Link to="/admin/tournois" className={detail.back}>
      ← TOUS LES TOURNOIS
    </Link>
  )

  if (status !== 'ready' || !tournament) {
    return (
      <>
        {back}
        <p className={detail.message} role={status === 'loading' ? undefined : 'alert'}>
          {status === 'loading' && 'Chargement du tournoi…'}
          {status === 'not-found' && 'Ce tournoi n’existe pas.'}
          {status === 'error' && 'Impossible de charger ce tournoi.'}
        </p>
      </>
    )
  }

  const bracket = tournamentBracket(tournament)
  const names = new Map(tournament.teams.map((t) => [t.id, t.name]))
  const name = (teamId: number | null) => (teamId !== null && names.get(teamId)) || '—'
  const rounds = [...new Set(tournament.matches.map((m) => m.round))].toSorted((a, b) => a - b)
  const chatTeam = tournament.teams.find((t) => t.id === chatId) ?? null

  // Chaque action réussie relit le tournoi ; le back pousse aussi le changement à tous les écrans abonnés.
  const act = async (action: () => Promise<void>, message: string) => {
    await action()
    reload()
    toast(message)
  }

  const onResult = (match: Match, scoreA: number, scoreB: number) =>
    act(
      () => recordResult(match.id, scoreA, scoreB),
      `${scoreA > scoreB ? name(match.teamAId) : name(match.teamBId)} remporte le match`,
    )
  const onForfeit = (match: Match, teamId: number) =>
    act(() => declareForfeit(match.id, teamId), `${name(teamId)} déclarée forfait`)
  const onSchedule = (match: Match, date: string | null) =>
    act(() => scheduleMatch(match.id, date), date ? 'Horaire enregistré' : 'Horaire effacé')

  return (
    <>
      {back}
      <div className={detail.head}>
        <div className={detail.titleBlock}>
          <h1 className={detail.title}>{tournament.name}</h1>
          <div className={detail.meta}>
            <StateBadge state={tournament.state} />
            <span>{tournament.game}</span>
            <span className={detail.sep} aria-hidden="true">
              ◆
            </span>
            <span>{dateLabel(tournament)}</span>
          </div>
        </div>
        {live && (
          <span className={detail.live}>
            <span className={detail.dot} aria-hidden="true" />
            EN DIRECT
          </span>
        )}
      </div>

      <div className={styles.controls}>
        <TournamentControls
          tournament={tournament}
          champion={bracket?.champion ?? null}
          onSetClosingDate={(date) =>
            act(
              () => setRegistrationClosesAt(tournament.id, date),
              date ? 'Date de clôture enregistrée' : 'Date de clôture effacée',
            )
          }
          onClose={() =>
            act(() => closeRegistrations(tournament.id), 'Inscriptions closes : l’arbre est tiré')
          }
          onStart={() => act(() => startTournament(tournament.id), 'Le tournoi est lancé')}
        />
      </div>

      {bracket && (
        <section className={admin.section} aria-labelledby="admin-bracket">
          <h2 id="admin-bracket" className={admin.sectionTitle}>
            Arbre
          </h2>
          <TournamentBracket rounds={bracket.rounds} champion={bracket.champion} myTeamId={null} />
        </section>
      )}

      {/* Matchs à arbitrer ou à programmer ; une fois le tournoi terminé, l'arbre suffit. */}
      {(tournament.state === 'closes' || tournament.state === 'cours') && (
        <section className={admin.section} aria-labelledby="admin-matches">
          <h2 id="admin-matches" className={admin.sectionTitle}>
            Matchs
          </h2>
          {rounds.map((round) => (
            <div key={round} className={styles.round}>
              <h3 className={styles.roundTitle}>{roundName(round)}</h3>
              <div className={styles.matches}>
                {tournament.matches
                  .filter((m) => m.round === round)
                  .toSorted((a, b) => a.position - b.position)
                  .map((match) => (
                    <AdminMatchCard
                      key={match.id}
                      match={match}
                      names={names}
                      live={tournament.state === 'cours'}
                      onResult={onResult}
                      onForfeit={onForfeit}
                      onSchedule={onSchedule}
                    />
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className={admin.section} aria-labelledby="admin-teams">
        <h2 id="admin-teams" className={admin.sectionTitle}>
          Équipes et salles du conseil
        </h2>
        <div className={styles.teams}>
          <AdminTeamList
            teams={tournament.teams}
            state={tournament.state}
            selectedId={chatTeam?.id ?? null}
            onSelect={selectChat}
          />
          {chatTeam && <AdminChat key={chatTeam.id} team={chatTeam} />}
        </div>
      </section>
    </>
  )
}
