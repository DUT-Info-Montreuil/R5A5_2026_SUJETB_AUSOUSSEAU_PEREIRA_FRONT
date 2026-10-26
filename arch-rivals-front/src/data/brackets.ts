import type { MatchResult, TournamentDetail } from '../types/tournament'

type Bracket = Pick<TournamentDetail, 'teams' | 'results'>

const at = (time: string, startsAt?: string): MatchResult => ({
  kind: 'scheduled',
  time,
  startsAt,
})
const done = (a: number, b: number): MatchResult => ({ kind: 'done', score: [a, b] })

/** Aujourd'hui à hh:mm (heure locale), pour que le « Ce soir » du mock reste vrai. */
function tonightAt(hours: number, minutes: number) {
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

// Données mock : arbres des tournois dont les inscriptions sont closes.
export const BRACKETS: Record<string, Bracket> = {
  t1: {
    teams: [
      "Chevaliers d'Avalon",
      'Bannière Noire',
      'Ordre du Griffon',
      'Les Templiers',
      'Garde de Fer',
      'Loups de Camelot',
      "Dragons d'Écosse",
      'Lions de Bretagne',
    ],
    results: {
      '0-0': done(13, 7),
      '0-1': done(13, 10),
      '0-2': done(9, 13),
      '0-3': { kind: 'live', score: [8, 6] },
      '1-0': at('Ce soir · 21h00', tonightAt(21, 0)),
      '1-1': at('Demain · 19h00'),
      '2-0': at('Sam. 1er nov. · 20h00'),
    },
  },
  t2: {
    teams: [
      "Lames d'Argent",
      'Sang Royal',
      'Hallebardes',
      'Vikings du Nord',
      'Épées Brisées',
      'Fils du Roc',
      'Croisés du Sud',
      'Héraut Pourpre',
    ],
    results: {
      '0-0': done(0, 2),
      '0-1': { kind: 'forfeit', forfeit: 'b' },
      '0-2': done(2, 0),
      '0-3': done(1, 2),
      '1-0': { kind: 'live', score: [1, 0] },
      '1-1': at('Jeu. 30 oct. · 20h00'),
      '2-0': at('Sam. 1er nov. · 21h00'),
    },
  },
  t4: {
    teams: [
      'Les Croisés',
      'Faucons de Lyon',
      'Ordre du Griffon',
      'Garde de Fer',
      'Héraut Pourpre',
      'Loups de Camelot',
      'Épées Brisées',
      'Fils du Roc',
    ],
    results: {
      '0-0': at('15 nov. · 20h00'),
      '0-1': at('15 nov. · 20h00'),
      '0-2': at('15 nov. · 21h30'),
      '0-3': at('15 nov. · 21h30'),
      '1-0': at('16 nov. · 20h00'),
      '1-1': at('16 nov. · 21h30'),
      '2-0': at('17 nov. · 20h00'),
    },
  },
  t6: {
    teams: [
      "Chevaliers d'Avalon",
      'Les Templiers',
      'Sang Royal',
      'Faucons de Lyon',
      'Lions de Bretagne',
      'Vikings du Nord',
      'Garde de Fer',
      'Hallebardes',
    ],
    results: {
      '0-0': done(13, 5),
      '0-1': done(11, 13),
      '0-2': done(13, 8),
      '0-3': done(13, 11),
      '1-0': done(13, 9),
      '1-1': done(10, 13),
      '2-0': done(13, 11),
    },
  },
  t7: {
    teams: [
      "Chevaliers d'Avalon",
      "Dragons d'Écosse",
      'Ordre du Griffon',
      'Bannière Noire',
      'Les Templiers',
      'Lions de Bretagne',
      'Sang Royal',
      'Fils du Roc',
    ],
    results: {
      '0-0': done(13, 6),
      '0-1': done(13, 10),
      '0-2': done(7, 13),
      '0-3': done(13, 4),
      '1-0': done(8, 13),
      '1-1': done(13, 11),
      '2-0': done(13, 9),
    },
  },
}
