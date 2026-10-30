import { useWallet } from '../../../hooks/useWallet'
import { ecus } from '../../../utils/bets'
import styles from './WalletBadge.module.css'

/** Solde d'Écus de l'utilisateur connecté ; rien pour un visiteur ou l'administrateur. */
export default function WalletBadge() {
  const { balance } = useWallet()
  if (balance === null) return null
  return (
    <span
      className={styles.badge}
      title="Écus à miser sur les matchs (+10 par heure tant que le solde est sous 100)"
    >
      <span aria-hidden="true">◈</span> {ecus(balance)}
    </span>
  )
}
