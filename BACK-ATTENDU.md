# Ce que le front attend du back

Les routes demandées par le front ont toutes été livrées (dépôt BACK, commits `555a487` et
`1f716d1`) et sont utilisées. Il reste une anomalie à corriger côté back.

## Anomalie : supprimer une équipe hors tournoi laisse ses membres (à corriger)

Constatée en testant les équipes hors tournoi contre le back (commit `1f716d1`).

1. Créer une équipe hors tournoi (`POST /api/teams`), puis la supprimer (`DELETE /api/teams/:id`).
2. Ses lignes restent dans `team_members` (avec `tournament_id` NULL).
3. La prochaine équipe créée reprend le même `id` (`INTEGER PRIMARY KEY` sans `AUTOINCREMENT`) et
   heurte le capitaine orphelin (`uq_one_captain_per_team`) : `409 TEAM_NAME_TAKEN`, alors que le nom
   est libre. Plus aucune équipe ne peut être créée, hors tournoi comme dans un tournoi.

Cause probable : la clé étrangère `(team_id, tournament_id) REFERENCES teams (id, tournament_id)
ON DELETE CASCADE` n'est pas vérifiée par SQLite quand `tournament_id` est NULL, donc la cascade ne
s'applique pas. Pistes : supprimer explicitement les membres (et demandes, messages) dans
`DELETE /api/teams/:id`, ou une clé étrangère simple `team_id REFERENCES teams(id) ON DELETE CASCADE`.
Le même cas se produit sans doute quand le dernier membre quitte une équipe hors tournoi.

## Rappel de configuration

L'origine du front doit figurer dans `CORS_ORIGIN` du `.env` du back
(`http://localhost:5173` en dev), sinon la connexion Socket.IO est refusée.
