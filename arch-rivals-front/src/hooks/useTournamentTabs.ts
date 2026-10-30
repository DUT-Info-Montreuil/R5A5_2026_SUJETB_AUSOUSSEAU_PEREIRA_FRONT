import { useSearchParams } from 'react-router'
import type { Tournament } from '../types/tournament'
import {
  inTab,
  isTournamentTab,
  matchesQuery,
  TOURNAMENT_TABS,
  type TournamentTab,
} from '../utils/tournaments'

/**
 * Onglets par état et recherche d'une liste de tournois (espace joueur, page publique). Ils vivent
 * dans l'URL : ils survivent à F5 et se partagent. Une recherche porte sur tous les onglets.
 */
export function useTournamentTabs(tournaments: readonly Tournament[]) {
  const [params, setParams] = useSearchParams()
  const rawTab = params.get('onglet')
  const tab: TournamentTab = isTournamentTab(rawTab) ? rawTab : 'cours'
  const query = params.get('q') ?? ''
  const searching = query.trim().length > 0

  return {
    query,
    searching,
    /** Onglet actif ; aucun pendant une recherche. */
    activeTab: searching ? null : tab,
    tabs: TOURNAMENT_TABS.map(({ id, label }) => ({
      id,
      label,
      count: tournaments.filter((t) => inTab(t, id)).length,
    })),
    visible: tournaments.filter((t) => (searching ? matchesQuery(t, query) : inTab(t, tab))),
    selectTab: (id: TournamentTab) => setParams({ onglet: id }),
    search: (value: string) =>
      setParams(value ? { onglet: tab, q: value } : { onglet: tab }, { replace: true }),
  }
}
