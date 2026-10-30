# Ce que le front attend du back

Rien n'est en attente. Les routes demandées par le front ont toutes été livrées (dépôt BACK, commits
`555a487`, `1f716d1`, `8e1ed90` et `5c98255`) et sont utilisées.

## Paris en Écus : livrés

Demandés par le front (spectateurs, pari mutuel match par match, classements du tournoi et de la
semaine), livrés dans les commits `8e1ed90` et `5c98255` ; la référence est le § 9 de
`FRONT-ATTENDU.md` du back. Les pronostics d'arbre ont été retirés du back.

Deux règles ont changé par rapport à la demande, pour éviter la triche et l'inflation, et le front
les applique :

- **Pas d'horaire, pas de paris** : un match sans `scheduledAt` n'est pas ouvert. Le front affiche
  « Paris à venir », et rappelle à l'administrateur de fixer l'horaire. Les paris ferment à cet
  horaire ; le back n'émet rien à ce moment-là, le front grise lui-même le formulaire.
- **Revenu passif plafonné à 100** : les 10 Écus par heure ne tombent que sous 100 Écus ;
  `nextIncomeAt` vaut alors `null`. Les gains de paris peuvent dépasser 100.

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
