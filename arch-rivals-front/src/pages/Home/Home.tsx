import { useState } from 'react'
import AuthDialog from '../../components/auth/AuthDialog'
import Bracket from '../../components/home/Bracket/Bracket'
import Hero from '../../components/home/Hero/Hero'
import Podium from '../../components/home/Podium/Podium'
import Footer from '../../components/layout/Footer/Footer'
import Header from '../../components/layout/Header/Header'
import { useAuth } from '../../hooks/useAuth'
import { DEFAULT_PODIUM, TEAMS } from '../../data/teams'
import type { BracketSize, Podium as PodiumData } from '../../types/tournament'
import { scrollToId } from '../../utils/scrollToId'
import styles from './Home.module.css'

type HomeProps = {
  bracketSize?: BracketSize
  animateCrown?: boolean
  podium?: PodiumData
}

export default function Home({
  bracketSize = 8,
  animateCrown = true,
  podium = DEFAULT_PODIUM,
}: HomeProps) {
  const [authOpen, setAuthOpen] = useState(false)
  const { status } = useAuth()

  const handlePlay = () => {
    if (status !== 'authenticated') {
      setAuthOpen(true)
      return
    }
    // TODO: une fois connecté, « Jouer » mènera à la page de jeu / matchmaking.
    scrollToId('tournois')
  }

  return (
    <div id="top" className={styles.page}>
      <Header onPlay={handlePlay} />
      <main>
        <Hero />
        <Bracket teams={TEAMS} bracketSize={bracketSize} />
        <Podium podium={podium} animateCrown={animateCrown} />
      </main>
      <Footer />
      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
