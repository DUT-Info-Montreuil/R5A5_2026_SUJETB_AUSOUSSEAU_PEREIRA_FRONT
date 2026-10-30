import { useSearchParams } from 'react-router'
import Tabs from '../../../components/layout/Tabs/Tabs'
import TournamentRow from '../../../components/tournaments/TournamentRow/TournamentRow'
import { useAllTournaments } from '../../../hooks/useAllTournaments'
import page from '../../../styles/listPage.module.css'
import {
  inTab,
  isTournamentTab,
  matchesQuery,
  TOURNAMENT_TABS,
  type TournamentTab,
} from '../../../utils/tournaments'

/** Recherche et avancement des tournois, ouverts à tous, sans compte (B-02). */
export default function PublicTournaments() {
  const { tournaments, status } = useAllTournaments()

  // Onglet et recherche vivent dans l'URL, comme dans l'espace joueur.
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('onglet')
  const tab: TournamentTab = isTournamentTab(rawTab) ? rawTab : 'cours'
  const query = params.get('q') ?? ''
  const searching = query.trim().length > 0

  const visible = tournaments.filter((t) => (searching ? matchesQuery(t, query) : inTab(t, tab)))
  const tabs = TOURNAMENT_TABS.map(({ id, label }) => ({
    id,
    label,
    count: tournaments.filter((t) => inTab(t, id)).length,
  }))

  const search = (value: string) =>
    setParams(value ? { onglet: tab, q: value } : { onglet: tab }, { replace: true })

  return (
    <>
      <div className={page.head}>
        <div>
          <p className={page.eyebrow}>✦ LES JOUTES DU ROYAUME</p>
          <h1 className={page.title}>Tournois</h1>
        </div>
        <input
          type="search"
          className={page.search}
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Chercher un tournoi ou un jeu…"
          aria-label="Chercher un tournoi ou un jeu"
        />
      </div>

      <Tabs
        tabs={tabs}
        active={searching ? null : tab}
        onSelect={(id) => setParams({ onglet: id })}
        label="Tournois par état"
      />

      {status === 'loading' && <p className={page.empty}>Chargement des tournois…</p>}
      {status === 'error' && (
        <p className={page.empty} role="alert">
          Impossible de charger les tournois.
        </p>
      )}
      {status === 'ready' && (
        <ul className={page.list}>
          {visible.map((t) => (
            <TournamentRow key={t.id} tournament={t} to={`/tournois/${t.id}`} />
          ))}
          {visible.length === 0 && <li className={page.empty}>Aucun tournoi ne correspond.</li>}
        </ul>
      )}
    </>
  )
}
