import Tabs from '../../../components/layout/Tabs/Tabs'
import TournamentRow from '../../../components/tournaments/TournamentRow/TournamentRow'
import { useAllTournaments } from '../../../hooks/useAllTournaments'
import { useTournamentTabs } from '../../../hooks/useTournamentTabs'
import page from '../../../styles/listPage.module.css'

/** Recherche et avancement des tournois, ouverts à tous, sans compte (B-02). */
export default function PublicTournaments() {
  const { tournaments, status } = useAllTournaments()
  const { query, activeTab, tabs, visible, selectTab, search } = useTournamentTabs(tournaments)

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

      <Tabs tabs={tabs} active={activeTab} onSelect={selectTab} label="Tournois par état" />

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
