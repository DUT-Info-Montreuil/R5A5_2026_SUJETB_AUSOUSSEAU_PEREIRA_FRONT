import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchWallet, onWalletUpdated } from '../services/bets'
import { WalletContext } from './walletContext'

/**
 * Portefeuille d'Écus de l'utilisateur connecté (pas l'administrateur, qui ne parie pas). Le back
 * crédite 10 Écus par heure tant que le solde est sous 100 : on relit le solde à l'heure annoncée
 * (`nextIncomeAt`, null au plafond), et à chaque changement (pari posé, annulé ou réglé), qui peut
 * relancer ce revenu.
 */
export default function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const bettor = user && !user.isAdmin ? user.id : null
  const [wallet, setWallet] = useState<{ userId: number; balance: number } | null>(null)
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    if (bettor === null) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = () =>
      fetchWallet()
        .then(({ balance, nextIncomeAt }) => {
          if (cancelled) return
          setWallet({ userId: bettor, balance })
          if (nextIncomeAt === null) return
          const wait = Math.max(new Date(nextIncomeAt).getTime() - Date.now(), 0) + 1_000
          timer = setTimeout(load, wait)
        })
        .catch(() => {
          /* pas de solde affiché : les paris restent consultables */
        })
    load()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [bettor, version])

  useEffect(() => (bettor === null ? undefined : onWalletUpdated(refresh)), [bettor, refresh])

  const value = useMemo(
    // Un autre compte (ou une déconnexion) ne garde pas le solde du précédent.
    () => ({ balance: wallet?.userId === bettor ? wallet.balance : null, refresh }),
    [wallet, bettor, refresh],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
