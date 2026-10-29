import type { CSSProperties } from 'react'
import { useFeaturedTournamentId } from '../../../hooks/useFeaturedTournament'
import { useTournament } from '../../../hooks/useTournament'
import type { Tournament } from '../../../types/tournament'
import { tournamentBracket } from '../../../utils/bracket'
import { closingLabel } from '../../../utils/dates'
import { STATE_LABELS, TEAMS_PER_TOURNAMENT, TOURNAMENT_FORMAT } from '../../../utils/tournaments'
import styles from './Bracket.module.css'

type BracketProps = {
  /** « Jouer » : connexion pour créer ou rejoindre une équipe. */
  onPlay: () => void
}

/** Section « Tableau du tournoi » de l'accueil : un vrai tournoi, en lecture seule. */
export default function Bracket({ onPlay }: BracketProps) {
  const featured = useFeaturedTournamentId()

  return (
    <section className={styles.section} aria-label="Tableau du tournoi">
      <div className={styles.frame}>
        {featured.status === 'loading' && <p className={styles.message}>Chargement du tournoi…</p>}
        {featured.status === 'error' && (
          <p className={styles.message}>Impossible de charger le tournoi du moment.</p>
        )}
        {featured.status === 'ready' && featured.id === null && (
          <p className={styles.message}>Aucun tournoi en cours ni à venir pour l'instant.</p>
        )}
        {featured.status === 'ready' && featured.id !== null && (
          <FeaturedTournament id={featured.id} onPlay={onPlay} />
        )}
      </div>
    </section>
  )
}

function FeaturedTournament({ id, onPlay }: { id: number; onPlay: () => void }) {
  // Suivi en direct : un résultat saisi par un arbitre apparaît sans recharger la page.
  const { tournament, status, live } = useTournament(id)
  if (status === 'loading') return <p className={styles.message}>Chargement du tournoi…</p>
  if (!tournament) return <p className={styles.message}>Impossible de charger le tournoi.</p>

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.heading}>
          <span className={styles.state}>
            {live && <span className={styles.dot} aria-hidden="true" />}
            {STATE_LABELS[tournament.state]}
          </span>
          <h2 className={styles.name}>{tournament.name}</h2>
          <span className={styles.game}>{tournament.game}</span>
        </div>
        <span className={styles.label}>{TOURNAMENT_FORMAT.toUpperCase()}</span>
      </div>
      {tournament.matches.length ? (
        <ReadOnlyBracket tournament={tournament} />
      ) : (
        <Upcoming tournament={tournament} onPlay={onPlay} />
      )}
    </>
  )
}

/** Arbre tiré : résultats saisis par les arbitres, rien n'est cliquable. */
function ReadOnlyBracket({ tournament }: { tournament: Tournament }) {
  const bracket = tournamentBracket(tournament)
  if (!bracket) return null
  const gridStyle = { '--bracket-cols': bracket.rounds.length + 1 } as CSSProperties

  return (
    <div className={styles.scroller}>
      <div className={styles.grid} style={gridStyle}>
        {bracket.rounds.map((round) => (
          <div key={round.label} className={styles.round} role="group" aria-label={round.label}>
            <span className={styles.roundLabel}>{round.label}</span>
            <div className={styles.matches}>
              {round.matches.map((match) => (
                <div key={match.key} className={styles.match}>
                  {match.rows.map((row, i) => (
                    <div key={i} className={`${styles.team} ${styles[row.outcome]}`}>
                      <span className={styles.name}>{row.team ?? '—'}</span>
                      <span className={styles.score}>{row.score}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className={styles.championCol}>
          <span className={styles.roundLabel}>CHAMPION</span>
          <div className={styles.matches}>
            <div className={styles.champion} aria-live="polite">
              {bracket.champion ?? 'À déterminer'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Tournoi à venir : équipes engagées, l'arbre sera tiré à la clôture. */
function Upcoming({ tournament, onPlay }: { tournament: Tournament; onPlay: () => void }) {
  const { teams, registrationClosesAt } = tournament
  return (
    <div className={styles.upcoming}>
      <p className={styles.upcomingTitle}>L'arbre sera tiré à la clôture des inscriptions</p>
      <p className={styles.upcomingText}>
        {teams.length} / {TEAMS_PER_TOURNAMENT} équipes engagées
        {registrationClosesAt && ` · ${closingLabel(registrationClosesAt)}`}
      </p>
      {teams.length > 0 && (
        <ul className={styles.teams}>
          {teams.map((team) => (
            <li key={team.id} className={styles.teamChip}>
              {team.name}
            </li>
          ))}
        </ul>
      )}
      {tournament.state === 'ouvertes' && (
        <button type="button" className={styles.play} onClick={onPlay}>
          Engager ma bannière
        </button>
      )}
    </div>
  )
}
