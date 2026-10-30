# Ce que le front attend du back

Les routes demandées jusqu'ici ont été livrées (dépôt BACK, commits `555a487` et `1f716d1`) et sont
utilisées. **En attente : les paris en Écus (§ Paris ci-dessous).**

## Paris en Écus (à construire)

Décidé avec Teddy et remplace les pronostics d'arbre (§ 9 de `FRONT-ATTENDU.md`, commit `e6021b7`),
que le front n'utilisera pas : à vous de voir s'il faut les retirer.

Pas d'argent réel : les Écus sont des points de jeu. Le spectateur mise des Écus sur une équipe, match
par match ; les gagnants d'un match se partagent la cagnotte du match (pari mutuel). Deux classements :
meilleur parieur d'un tournoi, et meilleur parieur de la semaine (tous tournois).

### Règles

- **Portefeuille** : 100 Écus à l'inscription, puis 10 Écus par heure pleine écoulée depuis
  l'inscription (calculés à la lecture, pas de tâche planifiée), plus les gains, moins les mises.
- **Qui parie** : un utilisateur connecté. Refusés : l'administrateur (`403 ADMIN_CANNOT_BET`, il saisit
  les résultats) et les joueurs d'une équipe du tournoi (`403 PLAYER_CANNOT_BET`).
- **Quand** : sur un match `ready` (ses deux équipes connues), tournoi `registration_closed` ou
  `in_progress`. Les paris ferment à l'horaire prévu du match (`scheduledAt`) s'il est fixé, sinon à la
  saisie du résultat ou du forfait (`409 BETS_CLOSED`).
- **Mise** : un pari par utilisateur et par match (`409 ALREADY_BET`), entier de 10 à son solde
  (`400` si moins de 10, `409 INSUFFICIENT_FUNDS` au-delà du solde). Annulable tant que les paris du
  match sont ouverts : la mise est rendue.
- **Règlement**, au résultat ou au forfait : cagnotte = somme des mises du match. Chaque gagnant reçoit
  `floor(mise × cagnotte / total misé sur le vainqueur)`. Si personne n'a misé sur le vainqueur, chacun
  est remboursé. Cote affichée d'une équipe : `cagnotte / total misé sur elle`.
- **Gain net** d'un pari réglé : `payout − mise` (négatif si perdu, 0 si remboursé).

### Routes

```
GET    /api/me/wallet                          → 200 { balance, nextIncomeAt }                        (connecté)
GET    /api/tournaments/:id/bets               → 200 { matches: [BetPoolDto] }                         (public)
GET    /api/tournaments/:id/bets/me            → 200 { bets: [MyBetDto] }                              (connecté)
POST   /api/matches/:id/bets { teamId, amount } → 201 { bet: MyBetDto, balance }                       (connecté)
DELETE /api/matches/:id/bets/me                → 200 { balance }                                       (auteur, paris ouverts)
GET    /api/tournaments/:id/bets/leaderboard   → 200 { leaderboard: [BettorDto], pagination }          (public)
GET    /api/bets/leaderboard?week=current|previous
                                               → 200 { from, to, leaderboard: [BettorDto], pagination } (public)
```

```ts
type BetPoolDto = {
  matchId: number
  open: boolean
  closesAt: string | null        // scheduledAt du match, null sans horaire
  pot: number                    // somme des mises
  pools: { teamId: number; total: number; bettors: number }[]   // une entrée par équipe du match
}
type MyBetDto = {
  matchId: number
  teamId: number
  amount: number
  status: 'pending' | 'won' | 'lost' | 'refunded'
  payout: number | null          // null tant que le match n'est pas réglé
}
type BettorDto = {
  rank: number
  user: { id: number; username: string }
  net: number                    // gain net cumulé sur les paris réglés (tournoi ou semaine)
  bets: number                   // paris réglés
  won: number                    // paris gagnés
}
```

- Classement d'un tournoi : paris réglés de ce tournoi, par `net` décroissant puis `won` décroissant.
- Classement de la semaine : paris réglés du lundi 00:00 au dimanche 23:59 (Europe/Paris), même tri ;
  `from` / `to` en ISO. Le revenu horaire n'y compte pas : seuls les paris.
- Erreurs : `{ error: { code, message } }` habituel ; `404 MATCH_NOT_FOUND`, `422 TEAM_NOT_IN_MATCH`.

### Temps réel

| Événement | Salon | Charge utile | Déclencheur |
|---|---|---|---|
| `bets:updated` | `tournament:<id>` | `{ tournamentId, matches: [BetPoolDto] }` | Pari posé ou annulé, match réglé |
| `wallet:updated` | `user:<id>` | `{ balance }` | Pari posé, annulé ou réglé |

### Front

`src/services/bets.ts` (routes et événements ci-dessus), `src/services/dto.ts` (types),
`src/components/bets/`, page `/paris` (classement de la semaine) et section « Paris » du détail d'un
tournoi.

## Anomalie corrigée : suppression d'une équipe hors tournoi

Constatée en testant les équipes hors tournoi (commit `1f716d1`), corrigée dans le commit `2788370`.

Supprimer une équipe hors tournoi laissait ses lignes dans `team_members` : la clé étrangère
composite `(team_id, tournament_id) REFERENCES teams (id, tournament_id) ON DELETE CASCADE` n'est pas
vérifiée par SQLite quand `tournament_id` est NULL, donc la cascade ne s'appliquait pas. Les autres
tables liées à l'équipe (demandes, messages, repères de lecture) ont une clé simple sur `team_id` et
étaient bien nettoyées. La prochaine équipe créée reprenait le même `id` et heurtait le capitaine
orphelin (`uq_one_captain_per_team`) : `409 TEAM_NAME_TAKEN`, et plus aucune équipe ne pouvait être
créée.

Correctif : la suppression d'une équipe (par le capitaine, ou au départ du dernier membre) retire
d'abord ses membres, dans la même transaction ; au démarrage, le back purge les membres orphelins
des bases existantes. Vérifié contre le back : création, suppression, nouvelle création (même `id`,
`201`), départ du dernier membre, aucun orphelin restant.
