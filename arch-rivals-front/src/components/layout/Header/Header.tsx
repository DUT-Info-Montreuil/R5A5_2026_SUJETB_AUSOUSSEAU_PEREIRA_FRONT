import { useAuth } from '../../../hooks/useAuth'
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
      <a href="#top" className={styles.logo}>
        ARCH RIVALS
      </a>
      <nav className={styles.nav} aria-label="Navigation principale">
        <a href="#tournois" className={styles.link}>
          Tournois
        </a>
        <a href="#classement" className={styles.link}>
          Classement
        </a>
        {connected && (
          <div className={styles.account}>
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
