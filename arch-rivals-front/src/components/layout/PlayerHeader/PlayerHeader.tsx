import { Link, NavLink } from 'react-router'
import { useAuth } from '../../../hooks/useAuth'
import { initials } from '../../../utils/initials'
import styles from './PlayerHeader.module.css'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.link} ${styles.active}` : styles.link

export default function PlayerHeader() {
  const { user } = useAuth()
  const username = user?.username ?? ''

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.diamond} aria-hidden="true" />
        ARCH RIVALS
      </Link>
      <nav className={styles.nav} aria-label="Espace joueur">
        <NavLink to="/joueur/tournois" className={navClass}>
          Tournois
        </NavLink>
        <NavLink to="/joueur/equipes" className={navClass}>
          Équipes
        </NavLink>
        <NavLink
          to="/joueur/profil"
          className={({ isActive }) =>
            isActive ? `${styles.profile} ${styles.profileActive}` : styles.profile
          }
        >
          <span className={styles.avatar} aria-hidden="true">
            {initials(username)}
          </span>
          <span className={styles.who}>
            <span className={styles.username}>{username}</span>
            <span className={styles.hint}>Voir mon profil</span>
          </span>
        </NavLink>
      </nav>
    </header>
  )
}
