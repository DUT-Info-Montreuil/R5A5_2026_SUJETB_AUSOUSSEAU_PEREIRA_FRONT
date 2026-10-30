import { useId, useState, type FormEvent } from 'react'
import { useAsyncAction } from '../../../hooks/useAsyncAction'
import { useNow } from '../../../hooks/useNow'
import { BET_MIN } from '../../../services/bets'
import type { BetPool, MyBet } from '../../../types/bet'
import type { Match } from '../../../types/tournament'
import { betOutcome, betWindow, ecus, estimatedPayout, odds, share } from '../../../utils/bets'
import { matchTimeLabel } from '../../../utils/dates'
import controls from '../../teams/controls.module.css'
import styles from './MatchBet.module.css'

type MatchBetProps = {
  match: Match
  names: ReadonlyMap<number, string>
  /** Cagnotte du match. */
  pool: BetPool | undefined
  myBet: MyBet | undefined
  /** Le lecteur peut parier sur ce tournoi (connecté, ni admin, ni joueur du tournoi). */
  canBet: boolean
  balance: number | null
  onPlace: (teamId: number, amount: number) => Promise<void>
  onCancel: () => Promise<void>
}

/** Un match côté parieurs : avis du public (part de la cagnotte, cote), ma mise, formulaire. */
export default function MatchBet({
  match,
  names,
  pool,
  myBet,
  canBet,
  balance,
  onPlace,
  onCancel,
}: MatchBetProps) {
  const teams = [match.teamAId, match.teamBId].flatMap((id) =>
    id === null ? [] : [{ id, name: names.get(id) ?? '—' }],
  )
  const bettors = pool?.pools.reduce((sum, p) => sum + p.bettors, 0) ?? 0
  const cancel = useAsyncAction()
  // Relue toutes les 15 s : les paris se ferment d'eux-mêmes à l'horaire du match.
  const now = useNow(15_000)
  const phase = betWindow(pool, match.status === 'finished', now)
  const open = phase === 'open'

  return (
    <article className={styles.card} aria-label={teams.map((t) => t.name).join(' contre ')}>
      <ul className={styles.teams}>
        {teams.map((team) => {
          const part = pool ? share(pool, team.id) : 0
          const mine = myBet?.teamId === team.id
          const won = match.winnerId === team.id
          return (
            <li key={team.id} className={won ? `${styles.team} ${styles.won}` : styles.team}>
              <span className={styles.name}>
                {team.name}
                {mine && <span className={styles.tag}>TA MISE</span>}
              </span>
              {pool?.pot ? (
                <span className={styles.figures}>
                  {part} %{odds(pool, team.id) && ` · ${odds(pool, team.id)}`}
                </span>
              ) : null}
              <span className={styles.bar} aria-hidden="true">
                <span className={styles.fill} style={{ width: `${part}%` }} />
              </span>
            </li>
          )
        })}
      </ul>

      <p className={styles.meta}>
        {phase === 'upcoming' || !pool
          ? 'Paris à venir : ils ouvrent quand l’horaire du match est fixé.'
          : `${ecus(pool.pot)} en jeu · ${bettors} parieur${bettors > 1 ? 's' : ''} · ${
              open && pool.closesAt
                ? `ouverts jusqu'à ${matchTimeLabel(pool.closesAt)}`
                : 'paris fermés'
            }`}
      </p>

      {myBet && (
        <div className={styles.mine}>
          <span>
            Ta mise : {ecus(myBet.amount)} sur {names.get(myBet.teamId) ?? '—'}
            {betOutcome(myBet) && <strong> · {betOutcome(myBet)}</strong>}
          </span>
          {myBet.status === 'pending' && open && (
            <button
              type="button"
              className={controls.btn}
              onClick={() => cancel.run(onCancel)}
              disabled={cancel.pending}
            >
              Annuler ma mise
            </button>
          )}
          {cancel.error && (
            <p className={controls.error} role="alert">
              {cancel.error}
            </p>
          )}
        </div>
      )}

      {!myBet && canBet && open && pool && (
        <BetForm pool={pool} teams={teams} balance={balance} onPlace={onPlace} />
      )}
    </article>
  )
}

function BetForm({
  pool,
  teams,
  balance,
  onPlace,
}: {
  pool: BetPool
  teams: { id: number; name: string }[]
  balance: number | null
  onPlace: (teamId: number, amount: number) => Promise<void>
}) {
  const id = useId()
  const [teamId, setTeamId] = useState<number | null>(null)
  const [amount, setAmount] = useState(String(BET_MIN))
  const [invalid, setInvalid] = useState<string | null>(null)
  const { pending, error, run } = useAsyncAction()
  const stake = Number(amount)
  const valid = /^\d+$/.test(amount) && stake >= BET_MIN
  const team = teams.find((t) => t.id === teamId)
  // L'erreur d'un essai précédent disparaît dès qu'on corrige l'équipe ou la mise.
  const pickTeam = (id: number) => {
    setInvalid(null)
    setTeamId(id)
  }
  const changeAmount = (value: string) => {
    setInvalid(null)
    setAmount(value)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const problem =
      teamId === null
        ? 'Choisis l’équipe sur laquelle miser.'
        : !valid
          ? `La mise minimale est de ${ecus(BET_MIN)}.`
          : balance !== null && stake > balance
            ? `Ton solde est de ${ecus(balance)}.`
            : null
    setInvalid(problem)
    if (!problem && teamId !== null) run(() => onPlace(teamId, stake))
  }

  const message = invalid ?? error

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.choices} role="group" aria-label="Équipe sur laquelle miser">
        {teams.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${controls.btn} ${t.id === teamId ? controls.primary : controls.gold}`}
            aria-pressed={t.id === teamId}
            onClick={() => pickTeam(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>
      <div className={styles.stake}>
        <label htmlFor={id} className={styles.label}>
          MISE
        </label>
        <input
          id={id}
          type="number"
          min={BET_MIN}
          max={balance ?? undefined}
          inputMode="numeric"
          className={styles.input}
          value={amount}
          onChange={(e) => changeAmount(e.target.value)}
        />
        <button type="submit" className={`${controls.btn} ${controls.primary}`} disabled={pending}>
          {pending ? 'Mise…' : 'Miser'}
        </button>
      </div>
      {message ? (
        <p className={controls.error} role="alert">
          {message}
        </p>
      ) : (
        team &&
        valid && (
          <p className={styles.hint}>
            Si {team.name} gagne : environ {ecus(estimatedPayout(pool, team.id, stake))}, selon les
            mises d'ici la fermeture.
          </p>
        )
      )}
    </form>
  )
}
