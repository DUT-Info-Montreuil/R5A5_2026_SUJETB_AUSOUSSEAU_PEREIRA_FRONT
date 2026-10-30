import { Link, NavLink, Outlet } from 'react-router'
import ToastProvider from '../../../context/ToastProvider'
import Footer from '../Footer/Footer'
import header from '../PlayerHeader/PlayerHeader.module.css'
import page from '../PlayerLayout/PlayerLayout.module.css'
import styles from './AdminLayout.module.css'

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${header.link} ${header.active}` : header.link

/** Enveloppe de l'espace administrateur : mêmes en-tête et pied de page que l'espace joueur. */
export default function AdminLayout() {
  return (
    <ToastProvider>
      <div className={page.page}>
        <header className={header.header}>
          <Link to="/" className={header.logo}>
            <span className={header.diamond} aria-hidden="true" />
            ARCH RIVALS
            <span className={styles.tag}>ADMIN</span>
          </Link>
          <nav className={header.nav} aria-label="Administration">
            <NavLink to="/admin/tournois" className={navClass}>
              Tournois
            </NavLink>
            <Link to="/joueur" className={`${header.link} ${styles.exit}`}>
              Espace joueur →
            </Link>
          </nav>
        </header>
        <main className={page.main}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  )
}
