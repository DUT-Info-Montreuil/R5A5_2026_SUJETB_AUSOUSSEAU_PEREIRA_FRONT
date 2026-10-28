import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import Tabs from '../../../components/layout/Tabs/Tabs'
import TeamChat from '../../../components/teams/TeamChat/TeamChat'
import TeamChips from '../../../components/teams/TeamChips/TeamChips'
import TeamDirectory from '../../../components/teams/TeamDirectory/TeamDirectory'
import TeamSheet from '../../../components/teams/TeamSheet/TeamSheet'
import { useNotifications } from '../../../hooks/useNotifications'
import { useMyTeams, type MyTeamEntry, type TeamActions } from '../../../hooks/useMyTeams'
import { useToastAfter } from '../../../hooks/useToast'
import { matchesTeamQuery, teamDirectory } from '../../../utils/teamDirectory'
import styles from './Teams.module.css'

type View = 'miennes' | 'toutes'

export default function Teams() {
  const { entries, status, userId, actionsFor, tournaments, requests, requestToJoin } = useMyTeams()
  const navigate = useNavigate()
  const toastAfter = useToastAfter()
  const { unread, setActiveTeam } = useNotifications()

  // Onglet, équipe affichée (?tournoi=12), recherche et filtre vivent dans l'URL :
  // « Mon équipe » y mène directement, et F5 garde la vue.
  const [params, setParams] = useSearchParams()
  const view: View = params.get('vue') === 'toutes' ? 'toutes' : 'miennes'
  const requested = Number(params.get('tournoi'))
  const current = entries.find((e) => e.tournament.id === requested) ?? entries[0]
  const query = params.get('q') ?? ''
  const recruitingOnly = params.get('recrute') === '1'

  // La salle du conseil affichée est lue : ses messages ne comptent pas dans le badge.
  const chatTeamId = view === 'miennes' && current ? current.team.id : null
  useEffect(() => {
    setActiveTeam(chatTeamId)
    return () => setActiveTeam(null)
  }, [chatTeamId, setActiveTeam])

  const directory = teamDirectory(tournaments, userId, requests)
  const visible = directory.filter(
    (entry) => matchesTeamQuery(entry, query) && (!recruitingOnly || entry.badge === 'recrute'),
  )

  const showTeam = (tournamentId: number) => setParams({ tournoi: String(tournamentId) })
  const filterDirectory = (next: { q?: string; recrute?: boolean }) => {
    const q = next.q ?? query
    const recrute = next.recrute ?? recruitingOnly
    setParams(
      { vue: 'toutes', ...(q && { q }), ...(recrute && { recrute: '1' }) },
      { replace: true },
    )
  }

  /** Après un départ ou une suppression, retour aux tournois à venir pour trouver une équipe. */
  const thenBackToTournaments = (action: () => Promise<void>) => async () => {
    await action()
    navigate('/joueur/tournois?onglet=avenir')
  }

  /** Actions sur l'équipe affichée, avec un toast de confirmation pour chacune. */
  function teamActions(entry: MyTeamEntry): TeamActions {
    const base = actionsFor(entry)
    const { team } = entry
    const nameOf = (id: number) =>
      team.members.find((m) => m.userId === id)?.username ?? 'Le joueur'
    return {
      ...base,
      rename: toastAfter(base.rename, () => 'Bannière renommée'),
      transferCaptaincy: toastAfter(
        base.transferCaptaincy,
        (id) => `${nameOf(id)} est désormais capitaine`,
      ),
      kick: toastAfter(base.kick, (id) => `${nameOf(id)} a été exclu de l’équipe`),
      accept: toastAfter(base.accept, (request) => `${request.username} rejoint l’équipe`),
      reject: toastAfter(base.reject, (request) => `Demande de ${request.username} refusée`),
      leave: thenBackToTournaments(toastAfter(base.leave, () => `Tu as quitté ${team.name}`)),
      remove: thenBackToTournaments(toastAfter(base.remove, () => `${team.name} a été dissoute`)),
    }
  }

  return (
    <>
      <p className={styles.eyebrow}>✦ UNE BANNIÈRE PAR TOURNOI</p>
      <h1 className={styles.title}>Équipes</h1>

      <Tabs
        tabs={[
          { id: 'miennes', label: 'Mes équipes', count: entries.length },
          { id: 'toutes', label: 'Toutes les équipes', count: directory.length },
        ]}
        active={view}
        onSelect={(id) => setParams(id === 'toutes' ? { vue: id } : {})}
        label="Équipes"
      />

      {status === 'loading' && <p className={styles.message}>Chargement des équipes…</p>}
      {status === 'error' && (
        <p className={styles.message} role="alert">
          Impossible de charger les équipes.
        </p>
      )}

      {status === 'ready' && view === 'toutes' && (
        <TeamDirectory
          entries={visible}
          query={query}
          onQueryChange={(q) => filterDirectory({ q })}
          recruitingOnly={recruitingOnly}
          onRecruitingOnlyChange={(recrute) => filterDirectory({ recrute })}
          onManage={(entry) => showTeam(entry.tournament.id)}
          onRequest={toastAfter(
            (entry) => requestToJoin(entry.tournament.id, entry.team),
            (entry) => `Demande envoyée à ${entry.team.name}`,
          )}
        />
      )}

      {status === 'ready' && view === 'miennes' && !current && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Tu ne portes encore aucune bannière</p>
          <Link to="/joueur/tournois?onglet=avenir" className={styles.cta}>
            Trouver un tournoi
          </Link>
        </div>
      )}

      {status === 'ready' && view === 'miennes' && current && (
        <>
          <TeamChips
            chips={entries.map(({ team, tournament }) => ({
              tournamentId: tournament.id,
              teamName: team.name,
              tournamentName: tournament.name,
              unread: unread[team.id] ?? 0,
            }))}
            selected={current.tournament.id}
            onSelect={showTeam}
          />
          <div className={styles.grid}>
            {/* key : changer d'équipe remet à zéro l'état d'interface (renommage, confirmations). */}
            <TeamSheet
              key={current.team.id}
              team={current.team}
              tournament={current.tournament}
              userId={userId}
              actions={teamActions(current)}
            />
            <TeamChat
              key={`chat-${current.team.id}`}
              teamId={current.team.id}
              userId={userId}
              eliminated={current.team.isEliminated}
            />
          </div>
        </>
      )}
    </>
  )
}
