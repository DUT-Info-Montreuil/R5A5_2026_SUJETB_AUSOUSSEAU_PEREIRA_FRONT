import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import CreateTournamentForm from '../../../components/admin/CreateTournamentForm/CreateTournamentForm'
import Tabs from '../../../components/layout/Tabs/Tabs'
import StateBadge from '../../../components/tournaments/StateBadge/StateBadge'
import controls from '../../../components/teams/controls.module.css'
import { useAdminTournaments } from '../../../hooks/useAdminTournaments'
import { useGames } from '../../../hooks/useGames'
import { useToast } from '../../../hooks/useToast'
import { createTournament } from '../../../services/admin'
import {
  ADMIN_FILTERS,
  inFilter,
  isAdminFilter,
  nextStep,
  type AdminFilter,
} from '../../../utils/admin'
import { dateLabel, matchesQuery, TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import styles from './AdminTournaments.module.css'

export default function AdminTournaments() {
  const { tournaments, status } = useAdminTournaments()
  const games = useGames()
  const toast = useToast()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)

  // Filtre et recherche vivent dans l'URL, comme dans l'espace joueur.
  const [params, setParams] = useSearchParams()
  const rawFilter = params.get('etat')
  const filter: AdminFilter = isAdminFilter(rawFilter) ? rawFilter : 'tous'
  const query = params.get('q') ?? ''

  const visible = tournaments
    .filter((t) => inFilter(t, filter) && matchesQuery(t, query))
    // Ce qui attend une décision d'abord, puis les plus récents.
    .toSorted(
      (a, b) =>
        Number(nextStep(b) !== null) - Number(nextStep(a) !== null) ||
        b.createdAt.localeCompare(a.createdAt),
    )

  const tabs = ADMIN_FILTERS.map(({ id, label }) => ({
    id,
    label,
    count: tournaments.filter((t) => inFilter(t, id)).length,
  }))

  const update = (next: { etat?: AdminFilter; q?: string }) => {
    const etat = next.etat ?? filter
    const q = next.q ?? query
    setParams({ ...(etat !== 'tous' && { etat }), ...(q && { q }) }, { replace: 'q' in next })
  }

  async function create(name: string, gameId: number, closesAt: string | null) {
    const id = await createTournament(name, gameId, closesAt)
    toast(`Tournoi « ${name} » créé : inscriptions ouvertes`)
    navigate(`/admin/tournois/${id}`)
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>✦ ADMINISTRATION</p>
          <h1 className={styles.title}>Tournois</h1>
        </div>
        <div className={styles.tools}>
          <input
            type="search"
            className={styles.search}
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Chercher un tournoi ou un jeu…"
            aria-label="Chercher un tournoi ou un jeu"
          />
          {!creating && (
            <button
              type="button"
              className={`${controls.btn} ${controls.primary}`}
              onClick={() => setCreating(true)}
              disabled={!games.length}
            >
              + Créer un tournoi
            </button>
          )}
        </div>
      </div>

      {creating && (
        <div className={styles.create}>
          <CreateTournamentForm
            games={games}
            onCreate={create}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      <Tabs
        tabs={tabs}
        active={filter}
        onSelect={(id) => update({ etat: id })}
        label="Tournois par état"
      />

      {status === 'loading' && <p className={styles.empty}>Chargement des tournois…</p>}
      {status === 'error' && (
        <p className={styles.empty} role="alert">
          Impossible de charger les tournois.
        </p>
      )}
      {status === 'ready' && (
        <ul className={styles.list}>
          {visible.map((t) => {
            const step = nextStep(t)
            return (
              <li key={t.id}>
                <Link to={`/admin/tournois/${t.id}`} className={styles.row}>
                  <span className={styles.main}>
                    <span className={styles.name}>{t.name}</span>
                    <span className={styles.meta}>
                      {t.game} · {dateLabel(t)}
                    </span>
                  </span>
                  <StateBadge state={t.state} />
                  {t.state !== 'termine' && (
                    <span className={styles.count}>
                      {t.teams.length} / {TEAMS_PER_TOURNAMENT} équipes
                    </span>
                  )}
                  {step && <span className={styles.step}>{step}</span>}
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            )
          })}
          {visible.length === 0 && <li className={styles.empty}>Aucun tournoi ne correspond.</li>}
        </ul>
      )}
    </>
  )
}
