import { Outlet } from 'react-router'
import Footer from '../Footer/Footer'
import PlayerHeader from '../PlayerHeader/PlayerHeader'
import styles from './PlayerLayout.module.css'

/** Enveloppe de l'espace joueur : l'en-tête reste monté d'une page à l'autre. */
export default function PlayerLayout() {
  return (
    <div className={styles.page}>
      <PlayerHeader />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
