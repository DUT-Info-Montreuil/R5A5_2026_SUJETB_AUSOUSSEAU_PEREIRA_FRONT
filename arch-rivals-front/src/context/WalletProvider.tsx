import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchWallet, onWalletUpdated } from '../services/bets'
import { WalletContext } from './walletContext'

/**
 * Portefeuille d'Écus de l'utilisateur connecté (pas l'administrateur, qui ne parie pas). Le back
 * crédite 10 Écus par heure à la lecture : on relit le solde à l'heure annoncée (`nextIncomeAt`).
 */
export default function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const bettor = user && !user.isAdmin ? user.id : null
  const [wallet, setWallet] = useState<{ userId: number; balance: number } | null>(null)

  useEffect(() => {
    if (bettor === null) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const load = () =>
      fetchWallet()
        .then(({ balance, nextIncomeAt }) => {
          if (cancelled) return
          setWallet({ userId: bettor, balance })
          const wait = Math.max(new Date(nextIncomeAt).getTime() - Date.now(), 0) + 1_000
          timer = setTimeout(load, wait)
        })
        .catch(() => {
          /* pas de solde affiché : les paris restent consultables */
        })
    load()
    const off = onWalletUpdated((balance) => setWallet({ userId: bettor, balance }))
    return () => {
      cancelled = true
      clearTimeout(timer)
      off()
    }
  }, [bettor])

  const value = useMemo(
    () => ({
      // Un autre compte (ou une déconnexion) ne garde pas le solde du précédent.
      balance: wallet?.userId === bettor ? wallet.balance : null,
      setBalance: (balance: number) => bettor !== null && setWallet({ userId: bettor, balance }),
    }),
    [wallet, bettor],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
