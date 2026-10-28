# À faire : espace joueur

Branche de travail : `feat/espace-joueur`. Maquette : `arch-rivals-front/docs/design/Espace_Joueur.dc.html`.
Contrat du back : `api-routes.md` du dépôt `R5A5_2026_SUJETB_AUSOUSSEAU_PEREIRA_BACK`.

> **Règle : on ne touche jamais au back.** C'est le front qui s'adapte au contrat d'API.

Un petit commit par point, dans l'ordre de ton choix.

## Features restantes de la maquette

- [ ] **Feature 7 : « Toutes les équipes »** (page Équipes, second onglet à côté de « Mes équipes »)
  - Recherche par équipe, tournoi, jeu ou capitaine.
  - Filtre « Qui recrutent » (inscriptions ouvertes et moins de 5 membres).
  - Carte d'équipe : bannière, tournoi et jeu, capitaine, effectif « n / 5 », badge
    RECRUTE / COMPLÈTE / FIGÉE ; mise en avant « ✦ TA BANNIÈRE » pour les équipes du joueur.
  - Action sur la carte : « Gérer mon équipe », « Demander à rejoindre », « Demande envoyée »,
    « Déjà engagé dans ce tournoi ».
  - Données : `GET /api/tournaments/:id/teams` (public, B-06).

- [ ] **Feature 8 : profil et notifications**
  - Page profil (`/joueur/profil`) : avatar, pseudo, lien vers mes équipes, statistiques
    (tournois, victoires, titres), « Derniers faits d'armes ».
  - Pastille de l'en-tête cliquable (« Voir mon profil ») + déconnexion.
  - Toasts de confirmation (« Demande envoyée à X », « Bannière renommée »…).
  - Badge sur « Équipes » : demandes en attente + messages non lus.

## Branchement sur le vrai back

Ce qui ne figure pas dans le contrat n'a pas de données côté back : horaire et score en direct des
matchs, date de clôture des inscriptions, cadenas équipe ouverte / fermée, présentation d'une demande.

Les noms exacts des champs JSON (tournoi, équipe, match, message) ne sont pas dans le contrat :
les isoler dans des DTO + mappers (`services/…`), un fichier par ressource, comme dans le cours.
`/openapi.json` du back qui tourne les donne (simple lecture).

- [ ] **2. Tournois et arbre sur l'API**
  - `GET /api/tournaments?search=&status=`, `GET /api/tournaments/:id`, `GET /api/tournaments/:id/matches`.
  - Statuts à traduire : `registration_open`, `registration_closed`, `in_progress`, `finished`.
  - Matchs : `round` 1 = quarts, 2 = demies, 3 = finale ; `position` ; statuts `pending` (équipes pas
    connues), `ready` (jouable), `finished` ; forfait (`is_forfeit`), vainqueur (`winner_id`).
  - Identifiants numériques (aujourd'hui des chaînes `t1`, `e1`… dans le mock).
  - Collections paginées : `{ "<liste>": [...], "pagination": { limit, offset, total } }`.

- [ ] **3. Jeux et rôles depuis l'API**
  - `GET /api/games` (public) remplace `GAME_ROLES`, `GAME_TAGS` et le type `Game` codés en dur
    dans `utils/tournaments.ts` et `types/tournament.ts`.

- [ ] **4. Équipes et demandes sur les vraies routes**
  - Créer : `POST /api/tournaments/:id/teams` ; renommer : `PATCH /api/teams/:id`.
  - Rôle : `PATCH /api/teams/:id/members/:userId` ; exclure : `DELETE /api/teams/:id/members/:userId`.
  - Capitaine : `POST /api/teams/:id/transfer-captaincy` ; quitter : `DELETE /api/teams/:id/members/me`.
  - Demandes : `POST /api/teams/:id/join-requests`, `GET /api/teams/:id/join-requests` (capitaine),
    `POST /api/join-requests/:id/accept`, `POST /api/join-requests/:id/reject`.
  - À ajouter au front :
    - annuler sa demande : `DELETE /api/join-requests/:id` ;
    - supprimer l'équipe (capitaine) : `DELETE /api/teams/:id` ;
    - le capitaine peut quitter : le membre arrivé le plus tôt devient capitaine,
      et s'il était seul l'équipe est supprimée.
  - Pas de route « mes équipes » : retrouver les équipes du joueur via `GET /api/tournaments/:id`
    (renvoie les équipes avec leurs membres).
  - Règles du back : toute modification refusée (`409`) une fois les inscriptions closes ; entrer
    dans une équipe annule ses autres demandes du tournoi ; à la clôture les demandes en attente
    sont rejetées.

- [ ] **5. Chat sur l'API + Socket.IO**
  - `GET /api/teams/:id/messages` (du plus récent au plus ancien, paginé) et `POST /api/teams/:id/messages`.
  - Équipe éliminée : `409 TEAM_CHAT_CLOSED` en lecture comme en écriture.
  - Ajouter la dépendance `socket.io-client` ; `io(origine, { auth: { token } })`, puis
    `emitWithAck('team:join', teamId)` ; renvoyer les `join` à chaque événement `connect`.
  - Événements : `message:new`, `team:updated`, `member:kicked` (sortir le joueur du chat),
    `team:deleted`, `session:expired` (se reconnecter avec un jeton neuf).
  - Remplacer `subscribeToMessages` de `services/chat.ts` (même signature, déjà utilisée par
    `hooks/useTeamChat.ts`).

- [ ] **6. Suivi en direct du tournoi, puis suppression du faux back**
  - `emitWithAck('tournament:join', tournamentId)` (ouvert à tous) ; événements
    `tournament:updated` et `match:updated` (B-19).
  - Remplace le rechargement toutes les 15 s de `hooks/useTournament.ts`.
  - Supprimer ensuite `services/mockBackend.ts` et les données de `src/data/` qui ne servent plus.
