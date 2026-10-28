import { Link, useNavigate, useSearchParams } from 'react-router'
import TeamChat from '../../../components/teams/TeamChat/TeamChat'
import TeamChips from '../../../components/teams/TeamChips/TeamChips'
import TeamSheet from '../../../components/teams/TeamSheet/TeamSheet'
import { useMyTeams } from '../../../hooks/useMyTeams'
import { useTournaments } from '../../../hooks/useTournaments'
import { playerProgress } from '../../../utils/bracket'
import styles from './Teams.module.css'

export default function Teams() {
  const { teams, status: teamsStatus, actionsFor } = useMyTeams()
  const navigate = useNavigate()
  const { tournaments, status: tournamentsStatus } = useTournaments()

  // L'équipe affichée vit dans l'URL (?tournoi=t1) : « Mon équipe » y mène directement.
  const [params, setParams] = useSearchParams()

  const status =
    teamsStatus === 'error' || tournamentsStatus === 'error'
      ? 'error'
      : teamsStatus === 'ready' && tournamentsStatus === 'ready'
        ? 'ready'
        : 'loading'

  // On n'affiche que les équipes dont le tournoi est connu.
  const entries = teams.flatMap((team) => {
    const tournament = tournaments.find((t) => String(t.id) === team.tournamentId)
    return tournament ? [{ team, tournament }] : []
  })
  const requested = params.get('tournoi')
  const current = entries.find((e) => String(e.tournament.id) === requested) ?? entries[0]

  return (
    <>
      <p className={styles.eyebrow}>✦ UNE BANNIÈRE PAR TOURNOI</p>
      <h1 className={styles.title}>Équipes</h1>

      {status === 'loading' && <p className={styles.message}>Chargement de tes équipes…</p>}
      {status === 'error' && (
        <p className={styles.message} role="alert">
          Impossible de charger tes équipes.
        </p>
      )}

      {status === 'ready' && !current && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Tu ne portes encore aucune bannière</p>
          <Link to="/joueur/tournois?onglet=avenir" className={styles.cta}>
            Trouver un tournoi
          </Link>
        </div>
      )}

      {status === 'ready' && current && (
        <>
          <TeamChips
            chips={entries.map(({ team, tournament }) => ({
              tournamentId: String(tournament.id),
              teamName: team.name,
              tournamentName: tournament.name,
            }))}
            selected={String(current.tournament.id)}
            onSelect={(id) => setParams({ tournoi: id })}
          />
          <div className={styles.grid}>
            {/* key : changer d'équipe remet à zéro l'état d'interface (renommage, confirmations). */}
            <TeamSheet
              key={current.tournament.id}
              team={current.team}
              tournament={current.tournament}
              actions={{
                ...actionsFor(String(current.tournament.id)),
                // Après un départ, retour aux tournois à venir pour trouver une autre équipe.
                leave: async () => {
                  await actionsFor(String(current.tournament.id)).leave()
                  navigate('/joueur/tournois?onglet=avenir')
                },
              }}
            />
            <TeamChat
              key={`chat-${current.tournament.id}`}
              tournamentId={String(current.tournament.id)}
              myMemberId={current.team.myMemberId}
              closed={playerProgress(current.tournament, null).kind === 'eliminated'}
            />
          </div>
        </>
      )}
    </>
  )
}
