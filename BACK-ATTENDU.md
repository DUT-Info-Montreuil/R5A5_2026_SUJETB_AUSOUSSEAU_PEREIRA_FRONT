# Ce que le front attend du back

Rien n'est en attente. Les routes demandées par le front ont toutes été livrées (dépôt BACK,
commits `555a487` et `1f716d1`) et sont utilisées.

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
