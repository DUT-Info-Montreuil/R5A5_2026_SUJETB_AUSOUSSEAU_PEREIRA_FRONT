import { useSearchParams } from 'react-router'
import BettorBoard from '../../components/bets/BettorBoard/BettorBoard'
import Tabs from '../../components/layout/Tabs/Tabs'
import { useAuth } from '../../hooks/useAuth'
import page from '../../styles/listPage.module.css'
import type { BetWeek } from '../../types/bet'

const WEEKS: readonly { id: BetWeek; label: string; param: string | null }[] = [
  { id: 'current', label: 'Cette semaine', param: null },
  { id: 'previous', label: 'Semaine dernière', param: 'precedente' },
]

/** Meilleurs parieurs de la semaine, tous tournois confondus (lundi → dimanche). */
export default function WeeklyBettors() {
  const { user } = useAuth()
  // Semaine affichée dans l'URL : `?semaine=precedente`, sinon la semaine en cours.
  const [params, setParams] = useSearchParams()
  const week: BetWeek = params.get('semaine') === 'precedente' ? 'previous' : 'current'

  return (
    <>
      <div className={page.head}>
        <div>
          <p className={page.eyebrow}>✦ TOUS TOURNOIS CONFONDUS</p>
          <h1 className={page.title}>Meilleurs parieurs</h1>
        </div>
      </div>
      <p className={page.intro}>
        Classés par Écus gagnés sur les paris réglés de la semaine, du lundi au dimanche. Le revenu
        horaire n'y compte pas.
      </p>
      <Tabs
        tabs={WEEKS}
        active={week}
        onSelect={(id) => {
          const param = WEEKS.find((w) => w.id === id)?.param
          setParams(param ? { semaine: param } : {})
        }}
        label="Semaine du classement"
      />
      <div className={page.list}>
        <BettorBoard
          key={week}
          board={{ week }}
          userId={user?.id ?? null}
          emptyText="Aucun pari réglé cette semaine-là."
        />
      </div>
    </>
  )
}
