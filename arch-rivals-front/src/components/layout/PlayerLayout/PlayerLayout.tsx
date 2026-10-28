import { Outlet } from 'react-router'
import TournamentsProvider from '../../../context/TournamentsProvider'
import { useAuth } from '../../../hooks/useAuth'
import Footer from '../Footer/Footer'
import PlayerHeader from '../PlayerHeader/PlayerHeader'
import styles from './PlayerLayout.module.css'

/** Enveloppe de l'espace joueur : l'en-tête reste monté d'une page à l'autre. */
export default function PlayerLayout() {
  const { user } = useAuth()

  return (
    // key : un autre compte repart de données vides.
    <TournamentsProvider key={user?.id ?? 'visiteur'}>
      <div className={styles.page}>
        <PlayerHeader />
        <main className={styles.main}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </TournamentsProvider>
  )
}
