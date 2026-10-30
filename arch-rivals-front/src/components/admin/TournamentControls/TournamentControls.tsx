import type { Tournament } from '../../../types/tournament'
import { incompleteReason, matchesToReferee } from '../../../utils/admin'
import { TEAMS_PER_TOURNAMENT } from '../../../utils/tournaments'
import ConfirmAction from '../../teams/ConfirmAction/ConfirmAction'
import admin from '../admin.module.css'
import DateTimeForm from '../DateTimeForm/DateTimeForm'

type TournamentControlsProps = {
  tournament: Tournament
  champion: string | null
  onSetClosingDate: (date: string | null) => Promise<void>
  onClose: () => Promise<void>
  onStart: () => Promise<void>
}

/** Pilotage du tournoi selon son état : clôture (B-03, B-12), lancement (B-04). */
export default function TournamentControls({
  tournament,
  champion,
  onSetClosingDate,
  onClose,
  onStart,
}: TournamentControlsProps) {
  const engaged = tournament.teams.length

  return (
    <section className={admin.panel} aria-label="Pilotage du tournoi">
      <h2 className={admin.panelTitle}>PILOTAGE</h2>

      {tournament.state === 'ouvertes' && (
        <>
          <DateTimeForm
            key={tournament.registrationClosesAt ?? ''}
            label="CLÔTURE PRÉVUE (INDICATIVE)"
            current={tournament.registrationClosesAt}
            onSave={onSetClosingDate}
          />
          {engaged === TEAMS_PER_TOURNAMENT ? (
            <ConfirmAction
              label="Clore les inscriptions"
              question="Clore les inscriptions ? Les équipes sont figées et l'arbre est tiré au sort ; les demandes en attente sont refusées."
              confirmLabel="Clore et tirer l'arbre"
              onConfirm={onClose}
            />
          ) : (
            <p className={admin.hint}>
              {engaged} / {TEAMS_PER_TOURNAMENT} équipes engagées : la clôture demande exactement{' '}
              {TEAMS_PER_TOURNAMENT} équipes.
            </p>
          )}
        </>
      )}

      {tournament.state === 'closes' && <StartControl tournament={tournament} onStart={onStart} />}

      {tournament.state === 'cours' && (
        <p className={admin.hint}>
          {matchesToReferee(tournament)
            ? 'Saisis les résultats des matchs à jouer ci-dessous : le gagnant avance dans l’arbre.'
            : 'Aucun match jouable pour l’instant.'}
        </p>
      )}

      {tournament.state === 'termine' && (
        <p className={admin.hint}>Tournoi terminé{champion ? ` : ${champion} l’emporte.` : '.'}</p>
      )}
    </section>
  )
}

/** Lancement : les équipes incomplètes à ce moment-là sont forfait sur leur premier match (B-04). */
function StartControl({
  tournament,
  onStart,
}: {
  tournament: Tournament
  onStart: () => Promise<void>
}) {
  const incomplete = tournament.teams
    .map((team) => ({ team, reason: incompleteReason(team) }))
    .filter((entry) => entry.reason !== null)

  return (
    <>
      {incomplete.length > 0 ? (
        <div className={admin.warning} role="note">
          Ces équipes sont incomplètes : elles perdront leur premier match par forfait.
          <ul>
            {incomplete.map(({ team, reason }) => (
              <li key={team.id}>
                {team.name} : {reason}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={admin.hint}>Les huit équipes sont au complet, rôles attribués.</p>
      )}
      <ConfirmAction
        label="Lancer le tournoi"
        question={
          incomplete.length
            ? `Lancer le tournoi ? ${incomplete.length} équipe${incomplete.length > 1 ? 's' : ''} déclarée${incomplete.length > 1 ? 's' : ''} forfait.`
            : 'Lancer le tournoi ? Les matchs deviennent jouables.'
        }
        confirmLabel="Lancer"
        onConfirm={onStart}
      />
    </>
  )
}
