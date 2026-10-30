import { createContext } from 'react'

type WalletContextValue = {
  /** Solde en Écus ; null sans portefeuille (visiteur, administrateur) ou pendant le chargement. */
  balance: number | null
  /** Relit le solde (après un pari posé ou annulé). */
  refresh: () => void
}

export const WalletContext = createContext<WalletContextValue | null>(null)
