import { useContext } from 'react'
import { WalletContext } from '../context/walletContext'

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet doit être utilisé dans <WalletProvider>.')
  return ctx
}
