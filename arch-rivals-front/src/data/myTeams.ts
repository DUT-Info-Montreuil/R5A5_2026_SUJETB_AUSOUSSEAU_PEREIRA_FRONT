import type { MyTeam } from '../types/team'

/** Identifiant du joueur connecté dans les données mock. */
export const ME = 'm-me'

/** Le joueur connecté, tel que le mock le représente dans ses équipes. */
export const meMember = (role: string) => ({ id: ME, username: 'Lancelot_V', role })

// Données mock : équipes du joueur connecté, viendront de l'API plus tard.
export const MY_TEAMS: readonly MyTeam[] = [
  {
    tournamentId: 't1',
    name: "Chevaliers d'Avalon",
    captainId: ME,
    visibility: 'open',
    myMemberId: ME,
    requests: [],
    members: [
      meMember('Duelliste'),
      { id: 'm-gauvain', username: 'Gauvain', role: 'Initiateur' },
      { id: 'm-perceval', username: 'Perceval.exe', role: 'Contrôleur' },
      { id: 'm-morgane', username: 'Morgane', role: 'Sentinelle' },
      { id: 'm-bohort', username: 'Bohort', role: 'Flex' },
    ],
  },
  {
    tournamentId: 't2',
    name: "Lames d'Argent",
    captainId: 'm-galaad',
    visibility: 'open',
    myMemberId: ME,
    requests: [],
    members: [
      { id: 'm-galaad', username: 'Galaad', role: 'Top' },
      { id: 'm-yvain', username: 'Yvain', role: 'Jungle' },
      { id: 'm-kay', username: 'Kay', role: 'Mid' },
      { id: 'm-lucan', username: 'Lucan', role: 'ADC' },
      meMember('Support'),
    ],
  },
  {
    tournamentId: 't3',
    name: "Chevaliers d'Avalon",
    captainId: ME,
    visibility: 'open',
    myMemberId: ME,
    requests: [
      { id: 'r-tristan', username: 'Tristan', note: 'Lurker · IUT de Vannes' },
      { id: 'r-iseult', username: 'Iseult', note: 'Support · IUT de Brest' },
    ],
    members: [
      meMember('Entry'),
      { id: 'm-gauvain', username: 'Gauvain', role: 'AWPer' },
      { id: 'm-perceval', username: 'Perceval.exe', role: 'IGL' },
      { id: 'm-morgane', username: 'Morgane', role: 'Support' },
    ],
  },
  {
    tournamentId: 't4',
    name: 'Les Croisés',
    captainId: 'm-arthur',
    visibility: 'open',
    myMemberId: ME,
    requests: [],
    members: [
      { id: 'm-arthur', username: 'Arthur_P', role: 'Tank' },
      meMember('DPS'),
      { id: 'm-merlin', username: 'Merlin', role: 'DPS' },
      { id: 'm-viviane', username: 'Viviane', role: 'Soutien' },
      { id: 'm-elaine', username: 'Élaine', role: 'Soutien' },
    ],
  },
]
