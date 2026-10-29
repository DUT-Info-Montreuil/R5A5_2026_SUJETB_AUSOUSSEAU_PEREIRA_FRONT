import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../../hooks/useAuth'
import { useMyTeams } from '../../../hooks/useMyTeams'
import { useProfileStats } from '../../../hooks/useProfileStats'
import { initials } from '../../../utils/initials'
import { FEAT_LABELS } from '../../../utils/profile'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, logout } = useAuth()
  const { entries } = useMyTeams()
  const { stats, status } = useProfileStats(user?.id ?? null)
  const navigate = useNavigate()
  const since = user
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : ''
  const tiles = stats
    ? [
        { value: String(stats.tournaments), label: 'TOURNOIS' },
        { value: stats.winRate === null ? '—' : `${stats.winRate} %`, label: 'VICTOIRES' },
        { value: String(stats.titles), label: 'TITRES' },
      ]
    : []

  function signOut() {
    logout()
    navigate('/')
  }

  return (
    <>
      <div className={styles.identity}>
        <div className={styles.avatar} aria-hidden="true">
          {initials(user?.username ?? '')}
        </div>
        <div className={styles.who}>
          <p className={styles.eyebrow}>
            {user?.isAdmin ? 'ADMINISTRATEUR' : 'JOUEUR'} · DEPUIS {since.toUpperCase()}
          </p>
          <h1 className={styles.title}>{user?.username}</h1>
          <Link to="/joueur/equipes" className={styles.teams}>
            Membre de {entries.length} équipe{entries.length > 1 ? 's' : ''} · voir mes équipes →
          </Link>
        </div>
      </div>

      {status === 'loading' && <p className={styles.message}>Chargement de tes exploits…</p>}
      {status === 'error' && (
        <p className={styles.message} role="alert">
          Impossible de charger tes statistiques.
        </p>
      )}

      {status === 'ready' && stats && (
        <>
          <dl className={styles.stats}>
            {tiles.map((tile) => (
              <div key={tile.label} className={styles.stat}>
                <dt className={styles.statLabel}>{tile.label}</dt>
                <dd className={styles.statValue}>{tile.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className={styles.heading}>DERNIERS FAITS D'ARMES</h2>
          {stats.history.length === 0 ? (
            <p className={styles.message}>Aucun tournoi terminé pour l'instant.</p>
          ) : (
            <ul className={styles.feats}>
              {stats.history.map((feat) => {
                const { label, tone } = FEAT_LABELS[feat.result]
                return (
                  <li key={feat.tournamentId} className={styles.feat}>
                    <Link to={`/joueur/tournois/${feat.tournamentId}`} className={styles.featName}>
                      {feat.name}
                    </Link>
                    <span className={`${styles.result} ${styles[tone]}`}>{label}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}

      <button type="button" className={styles.logout} onClick={signOut}>
        Se déconnecter
      </button>
    </>
  )
}
