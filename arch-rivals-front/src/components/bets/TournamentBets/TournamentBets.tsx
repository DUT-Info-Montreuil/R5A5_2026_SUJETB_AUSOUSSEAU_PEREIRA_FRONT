import { useAuth } from '../../../hooks/useAuth'
import { useTournamentBets } from '../../../hooks/useTournamentBets'
import { useWallet } from '../../../hooks/useWallet'
import type { Tournament } from '../../../types/tournament'
import { betRefusal } from '../../../utils/bets'
import { roundName } from '../../../utils/bracket'
import controls from '../../teams/controls.module.css'
import BettorBoard from '../BettorBoard/BettorBoard'
import MatchBet from '../MatchBet/MatchBet'
import styles from './TournamentBets.module.css'

const REFUSALS = {
  admin: 'L’administrateur ne parie pas : c’est lui qui saisit les résultats.',
  player: 'Tu joues dans ce tournoi : tu ne peux pas parier dessus.',
}

type TournamentBetsProps = {
  /** Arbre tiré : inscriptions closes, en cours ou terminé. */
  tournament: Tournament
  /** Visiteur : ouvre la connexion (pages publiques). */
  onLogin?: () => void
}

/** Paris en Écus d'un tournoi, match par match, et ses meilleurs parieurs. */
export default function TournamentBets({ tournament, onLogin }: TournamentBetsProps) {
  const { user } = useAuth()
  const { balance } = useWallet()
  const refusal = betRefusal(user, tournament)
  const { pools, status, version, myBets, place, cancel } = useTournamentBets(
    tournament.id,
    refusal === null,
  )
  const names = new Map(tournament.teams.map((t) => [t.id, t.name]))
  // Seuls les matchs dont les deux équipes sont connues se parient.
  const matches = tournament.matches.filter((m) => m.teamAId !== null && m.teamBId !== null)
  const rounds = [...new Set(matches.map((m) => m.round))].toSorted((a, b) => a - b)

  return (
    <section className={styles.section} aria-labelledby="bets-title">
      <h2 id="bets-title" className={styles.title}>
        Paris
      </h2>
      <p className={styles.rules}>
        Mise des Écus sur une équipe, match par match : les gagnants se partagent la cagnotte du
        match au prorata de leur mise. Pas d'argent réel : 100 Écus à l'inscription, puis 10 par
        heure tant que ton solde est sous 100. Les paris d'un match ouvrent quand son horaire est
        fixé et ferment à cet horaire.
      </p>
      {refusal === 'anonymous' && onLogin && (
        <button
          type="button"
          className={`${controls.btn} ${controls.primary} ${styles.login}`}
          onClick={onLogin}
        >
          Se connecter pour parier
        </button>
      )}
      {(refusal === 'admin' || refusal === 'player') && (
        <p className={styles.note}>{REFUSALS[refusal]}</p>
      )}

      {status === 'loading' && <p className={styles.note}>Chargement des paris…</p>}
      {status === 'error' && (
        <p className={styles.note} role="alert">
          Paris indisponibles pour l'instant.
        </p>
      )}
      {status === 'ready' &&
        rounds.map((round) => (
          <div key={round}>
            <h3 className={styles.roundTitle}>{roundName(round)}</h3>
            <div className={styles.matches}>
              {matches
                .filter((m) => m.round === round)
                .toSorted((a, b) => a.position - b.position)
                .map((match) => (
                  <MatchBet
                    key={match.id}
                    match={match}
                    names={names}
                    pool={pools.find((p) => p.matchId === match.id)}
                    myBet={myBets.find((b) => b.matchId === match.id)}
                    canBet={refusal === null}
                    balance={balance}
                    onPlace={(teamId, amount) => place(match.id, teamId, amount)}
                    onCancel={() => cancel(match.id)}
                  />
                ))}
            </div>
          </div>
        ))}

      <h3 className={styles.boardTitle}>Meilleurs parieurs du tournoi</h3>
      <BettorBoard
        key={tournament.id}
        board={{ tournamentId: tournament.id }}
        userId={user?.id ?? null}
        version={version}
        emptyText="Aucun pari réglé pour l'instant : le classement s'ouvre au premier résultat."
      />
    </section>
  )
}
