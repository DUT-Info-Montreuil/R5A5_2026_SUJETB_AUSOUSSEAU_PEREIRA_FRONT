import Bracket from '../../components/home/Bracket/Bracket'
import Hero from '../../components/home/Hero/Hero'
import Podium from '../../components/home/Podium/Podium'
import { usePlay } from '../../hooks/usePlay'
import { usePodium } from '../../hooks/usePodium'

export default function Home() {
  const onPlay = usePlay()
  const podium = usePodium()
  return (
    <>
      <Hero />
      <Bracket onPlay={onPlay} />
      <Podium podium={podium} />
    </>
  )
}
