import { Link, useNavigate, useSearchParams } from 'react-router'
import Tabs from '../../../components/layout/Tabs/Tabs'
import TeamChat from '../../../components/teams/TeamChat/TeamChat'
import TeamChips from '../../../components/teams/TeamChips/TeamChips'
import TeamDirectory from '../../../components/teams/TeamDirectory/TeamDirectory'
import TeamSheet from '../../../components/teams/TeamSheet/TeamSheet'
import { useMyTeams } from '../../../hooks/useMyTeams'
import { matchesTeamQuery, teamDirectory } from '../../../utils/teamDirectory'
import styles from './Teams.module.css'

type View = 'miennes' | 'toutes'

export default function Teams() {
  const { entries, status, userId, actionsFor, tournaments, requests, requestToJoin } = useMyTeams()
  const navigate = useNavigate()

  // Onglet, équipe affichée (?tournoi=12), recherche et filtre vivent dans l'URL :
  // « Mon équipe » y mène directement, et F5 garde la vue.
  const [params, setParams] = useSearchParams()
  const view: View = params.get('vue') === 'toutes' ? 'toutes' : 'miennes'
  const requested = Number(params.get('tournoi'))
  const current = entries.find((e) => e.tournament.id === requested) ?? entries[0]
  const query = params.get('q') ?? ''
  const recruitingOnly = params.get('recrute') === '1'

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
          onRequest={(entry) => requestToJoin(entry.tournament.id, entry.team)}
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
              actions={{
                ...actionsFor(current),
                leave: thenBackToTournaments(actionsFor(current).leave),
                remove: thenBackToTournaments(actionsFor(current).remove),
              }}
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
