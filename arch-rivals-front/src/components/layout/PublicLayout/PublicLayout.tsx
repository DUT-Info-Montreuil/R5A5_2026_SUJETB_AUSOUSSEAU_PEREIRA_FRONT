import { useState } from 'react'
import { Outlet, useMatch, useNavigate } from 'react-router'
import { useAuth } from '../../../hooks/useAuth'
import type { PublicContext } from '../../../hooks/usePlay'
import AuthDialog from '../../auth/AuthDialog'
import Footer from '../Footer/Footer'
import Header from '../Header/Header'
import styles from './PublicLayout.module.css'

/** Enveloppe des pages ouvertes aux visiteurs : accueil et tournois (B-02). */
export default function PublicLayout() {
  const [authOpen, setAuthOpen] = useState(false)
  const { status } = useAuth()
  const navigate = useNavigate()
  // L'accueil occupe toute la largeur ; les autres pages sont centrées comme l'espace joueur.
  const home = useMatch('/') !== null

  const onPlay = () => {
    if (status !== 'authenticated') {
      setAuthOpen(true)
      return
    }
    navigate('/joueur')
  }

  return (
    <div id="top" className={styles.page}>
      <Header onPlay={onPlay} />
      <main className={home ? undefined : styles.content}>
        <Outlet context={{ onPlay } satisfies PublicContext} />
      </main>
      <Footer />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
