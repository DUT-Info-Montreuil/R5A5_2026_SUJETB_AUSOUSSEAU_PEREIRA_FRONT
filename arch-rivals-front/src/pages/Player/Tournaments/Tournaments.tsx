import Tabs from '../../../components/layout/Tabs/Tabs'
import NextMatchBanner from '../../../components/tournaments/NextMatchBanner/NextMatchBanner'
import TournamentCard from '../../../components/tournaments/TournamentCard/TournamentCard'
import { useAuth } from '../../../hooks/useAuth'
import { useToastAfter } from '../../../hooks/useToast'
import { useTournamentTabs } from '../../../hooks/useTournamentTabs'
import { useTournaments } from '../../../hooks/useTournaments'
import { pickNextMatch } from '../../../utils/bracket'
import styles from './Tournaments.module.css'

export default function Tournaments() {
  const { user } = useAuth()
  const { tournaments, status, userId, requests, createTeam, requestToJoin, cancelRequest } =
    useTournaments()
  const toastAfter = useToastAfter()

  const { query, searching, activeTab, tabs, visible, selectTab, search } =
    useTournamentTabs(tournaments)
  const next = pickNextMatch(tournaments, userId)

  return (
    <>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>✦ BIENVENUE, SIRE {user?.username.toUpperCase()}</p>
          <h1 className={styles.title}>Tes tournois</h1>
        </div>
        <input
          type="search"
          className={styles.search}
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Chercher un tournoi ou un jeu…"
          aria-label="Chercher un tournoi ou un jeu"
        />
      </div>

      {next && <NextMatchBanner tournament={next.tournament} match={next.match} />}

      <Tabs tabs={tabs} active={activeTab} onSelect={selectTab} label="Tournois par état" />

      {searching && (
        <p className={styles.note}>
          {visible.length} résultat{visible.length > 1 ? 's' : ''} pour « {query.trim()} »
        </p>
      )}

      {status === 'loading' && <p className={styles.empty}>Chargement des tournois…</p>}
      {status === 'error' && (
        <p className={styles.empty} role="alert">
          Impossible de charger les tournois.
        </p>
      )}
      {status === 'ready' && (
        <div className={styles.list}>
          {visible.map((t) => (
            <TournamentCard
              key={t.id}
              tournament={t}
              userId={userId}
              request={requests[t.id] ?? null}
              onCreateTeam={toastAfter(createTeam, (_id, name) => `Bannière « ${name} » levée !`)}
              onRequestToJoin={toastAfter(
                requestToJoin,
                (_id, team) => `Demande envoyée à ${team.name}`,
              )}
              onCancelRequest={toastAfter(cancelRequest, (id) =>
                requests[id] ? `Demande à ${requests[id].teamName} annulée` : 'Demande annulée',
              )}
            />
          ))}
          {visible.length === 0 && <p className={styles.empty}>Aucun tournoi ne correspond.</p>}
        </div>
      )}
    </>
  )
}
