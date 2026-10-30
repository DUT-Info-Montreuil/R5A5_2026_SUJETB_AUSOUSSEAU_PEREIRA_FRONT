import { createContext } from 'react'

type WalletContextValue = {
  /** Solde en Écus ; null sans portefeuille (visiteur, administrateur) ou pendant le chargement. */
  balance: number | null
  /** Solde renvoyé par le back après un pari posé ou annulé. */
  setBalance: (balance: number) => void
}

export const WalletContext = createContext<WalletContextValue | null>(null)
