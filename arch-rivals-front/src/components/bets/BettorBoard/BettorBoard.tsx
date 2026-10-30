import { useState } from 'react'
import { useBettors, type BettorBoard as Board } from '../../../hooks/useBettors'
import { LEADERBOARD_PAGE } from '../../../services/bets'
import { ecus } from '../../../utils/bets'
import controls from '../../teams/controls.module.css'
import styles from './BettorBoard.module.css'

type BettorBoardProps = {
  board: Board
  /** Lecteur connecté : sa ligne est mise en avant. */
  userId: number | null
  /** Change quand des paris sont réglés : la page est relue. */
  version?: number
  emptyText: string
}

/** Classement des parieurs par gain net (rang, pseudo, gain net, paris gagnés), paginé. */
export default function BettorBoard({ board, userId, version, emptyText }: BettorBoardProps) {
  const [offset, setOffset] = useState(0)
  const { page, status } = useBettors(board, offset, version)

  if (status === 'loading') return <p className={styles.empty}>Chargement du classement…</p>
  if (!page)
    return (
      <p className={styles.empty} role="alert">
        Classement indisponible pour l'instant.
      </p>
    )
  if (!page.total) return <p className={styles.empty}>{emptyText}</p>

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Rang</th>
            <th scope="col">Parieur</th>
            <th scope="col">Gain net</th>
            <th scope="col">Paris gagnés</th>
          </tr>
        </thead>
        <tbody>
          {page.bettors.map((b) => (
            <tr key={b.userId} className={b.userId === userId ? styles.me : undefined}>
              <td className={styles.rank}>{b.rank}</td>
              <td>
                {b.username}
                {b.userId === userId && <span className="sr-only"> (toi)</span>}
              </td>
              <td className={b.net < 0 ? styles.loss : styles.gain}>{ecus(b.net, true)}</td>
              <td>
                {b.won} / {b.bets}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {page.total > LEADERBOARD_PAGE && (
        <div className={styles.pager}>
          <button
            type="button"
            className={controls.btn}
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(offset - LEADERBOARD_PAGE, 0))}
          >
            ← Précédents
          </button>
          <span>
            {offset + 1}–{Math.min(offset + LEADERBOARD_PAGE, page.total)} sur {page.total}
          </span>
          <button
            type="button"
            className={controls.btn}
            disabled={offset + LEADERBOARD_PAGE >= page.total}
            onClick={() => setOffset(offset + LEADERBOARD_PAGE)}
          >
            Suivants →
          </button>
        </div>
      )}
    </>
  )
}
