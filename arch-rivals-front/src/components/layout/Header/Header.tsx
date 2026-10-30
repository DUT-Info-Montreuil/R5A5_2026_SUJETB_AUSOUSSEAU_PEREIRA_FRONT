import { Link } from 'react-router'
import { useAuth } from '../../../hooks/useAuth'
import WalletBadge from '../../bets/WalletBadge/WalletBadge'
import styles from './Header.module.css'

type HeaderProps = {
  /** Clic sur « Jouer » : modale de connexion si déconnecté, sinon accès au jeu. */
  onPlay: () => void
}

export default function Header({ onPlay }: HeaderProps) {
  const { user, status, logout } = useAuth()
  const connected = status === 'authenticated' && user

  return (
    <header className={styles.header}>
      <a href="/#top" className={styles.logo}>
        ARCH RIVALS
      </a>
      <nav className={styles.nav} aria-label="Navigation principale">
        <Link to="/tournois" className={styles.link}>
          Tournois
        </Link>
        <Link to="/paris" className={styles.link}>
          Paris
        </Link>
        <a href="/#classement" className={styles.link}>
          Classement
        </a>
        {connected && (
          <div className={styles.account}>
            <WalletBadge />
            <span className={styles.user} title={user.username}>
              <span className="sr-only">Connecté en tant que </span>
              {user.username}
            </span>
            <button type="button" className={styles.logout} onClick={logout}>
              Déconnexion
            </button>
          </div>
        )}
        <button
          type="button"
          className={styles.play}
          onClick={onPlay}
          aria-haspopup={connected ? undefined : 'dialog'}
          disabled={status === 'loading'}
        >
          Jouer
        </button>
      </nav>
    </header>
  )
}
