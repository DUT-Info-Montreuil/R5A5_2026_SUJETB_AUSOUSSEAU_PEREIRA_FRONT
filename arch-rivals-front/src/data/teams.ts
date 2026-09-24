import type { Podium, Team } from '../types/tournament'

// Données mock : viendront de l'API plus tard.
export const TEAMS: readonly Team[] = [
  "Chevaliers d'Avalon",
  'Bannière Noire',
  'Ordre du Griffon',
  'Les Templiers',
  'Garde de Fer',
  'Loups de Camelot',
  "Dragons d'Écosse",
  'Lions de Bretagne',
  'Faucons de Lyon',
  'Sang Royal',
  'Hallebardes',
  'Vikings du Nord',
  'Épées Brisées',
  'Fils du Roc',
  'Croisés',
  'Héraut Pourpre',
]

export const DEFAULT_PODIUM: Podium = {
  first: "Chevaliers d'Avalon",
  second: 'Ordre du Griffon',
  third: 'Loups de Camelot',
}
