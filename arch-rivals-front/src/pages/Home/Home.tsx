import Bracket from '../../components/home/Bracket/Bracket'
import Hero from '../../components/home/Hero/Hero'
import Podium from '../../components/home/Podium/Podium'
import { DEFAULT_PODIUM } from '../../data/teams'
import { usePlay } from '../../hooks/usePlay'
import type { Podium as PodiumData } from '../../types/tournament'

type HomeProps = {
  animateCrown?: boolean
  podium?: PodiumData
}

export default function Home({ animateCrown = true, podium = DEFAULT_PODIUM }: HomeProps) {
  const onPlay = usePlay()
  return (
    <>
      <Hero />
      <Bracket onPlay={onPlay} />
      <Podium podium={podium} animateCrown={animateCrown} />
    </>
  )
}
