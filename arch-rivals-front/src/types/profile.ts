/** Résultat final d'un tournoi terminé : vainqueur, finaliste, demi-finaliste, quart. */
export type FeatResult = 'champion' | 'final' | 'semi' | 'quarter'

export type FeatOfArms = {
  tournamentId: number
  /** « Joute d'Automne · League of Legends » */
  name: string
  result: FeatResult
}

export type ProfileStats = {
  /** Tournois lancés ou terminés où le joueur a porté une bannière. */
  tournaments: number
  /** Part des matchs joués gagnés (en %), null si aucun match joué. */
  winRate: number | null
  titles: number
  /** Derniers tournois terminés, du plus récent au plus ancien. */
  history: FeatOfArms[]
}
