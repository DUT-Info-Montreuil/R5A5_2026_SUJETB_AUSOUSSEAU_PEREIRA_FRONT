import { useSearchParams } from 'react-router'
import NextMatchBanner from '../../../components/tournaments/NextMatchBanner/NextMatchBanner'
import TournamentCard from '../../../components/tournaments/TournamentCard/TournamentCard'
import TournamentTabs from '../../../components/tournaments/TournamentTabs/TournamentTabs'
import { useAuth } from '../../../hooks/useAuth'
import { useTournaments } from '../../../hooks/useTournaments'
import { pickNextMatch } from '../../../utils/bracket'
import {
  inTab,
  isTournamentTab,
  matchesQuery,
  TOURNAMENT_TABS,
  type TournamentTab,
} from '../../../utils/tournaments'
import styles from './Tournaments.module.css'

export default function Tournaments() {
  const { user } = useAuth()
  const { tournaments, status } = useTournaments()

  // Onglet et recherche vivent dans l'URL : ils survivent à F5 et se partagent.
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('onglet')
  const tab: TournamentTab = isTournamentTab(rawTab) ? rawTab : 'cours'
  const query = params.get('q') ?? ''
  const searching = query.trim().length > 0

  const visible = searching
    ? tournaments.filter((t) => matchesQuery(t, query))
    : tournaments.filter((t) => inTab(t, tab))

  const next = pickNextMatch(tournaments)

  const tabs = TOURNAMENT_TABS.map(({ id, label }) => ({
    id,
    label,
    count: tournaments.filter((t) => inTab(t, id)).length,
  }))

  const selectTab = (id: TournamentTab) => setParams({ onglet: id })
  const search = (value: string) =>
    setParams(value ? { onglet: tab, q: value } : { onglet: tab }, { replace: true })

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

      <TournamentTabs tabs={tabs} active={searching ? null : tab} onSelect={selectTab} />

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
            <TournamentCard key={t.id} tournament={t} />
          ))}
          {visible.length === 0 && <p className={styles.empty}>Aucun tournoi ne correspond.</p>}
        </div>
      )}
    </>
  )
}
