import { Link, useNavigate, useSearchParams } from 'react-router'
import TeamChat from '../../../components/teams/TeamChat/TeamChat'
import TeamChips from '../../../components/teams/TeamChips/TeamChips'
import TeamSheet from '../../../components/teams/TeamSheet/TeamSheet'
import { useMyTeams } from '../../../hooks/useMyTeams'
import styles from './Teams.module.css'

export default function Teams() {
  const { entries, status, userId, actionsFor } = useMyTeams()
  const navigate = useNavigate()

  // L'équipe affichée vit dans l'URL (?tournoi=12) : « Mon équipe » y mène directement.
  const [params, setParams] = useSearchParams()
  const requested = Number(params.get('tournoi'))
  const current = entries.find((e) => e.tournament.id === requested) ?? entries[0]

  /** Après un départ ou une suppression, retour aux tournois à venir pour trouver une équipe. */
  const thenBackToTournaments = (action: () => Promise<void>) => async () => {
    await action()
    navigate('/joueur/tournois?onglet=avenir')
  }

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
              tournamentId: tournament.id,
              teamName: team.name,
              tournamentName: tournament.name,
            }))}
            selected={current.tournament.id}
            onSelect={(id) => setParams({ tournoi: String(id) })}
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
              tournamentId={String(current.tournament.id)}
              myMemberId={String(userId)}
              closed={current.team.isEliminated}
            />
          </div>
        </>
      )}
    </>
  )
}
