# Ce que le front attend du back

> **Points 1 à 6 : livrés.** Le back les a ajoutés (dépôt BACK, commit `555a487`, voir son
> `FRONT-ATTENDU.md`) et le front les utilise. Le stockage local et le calcul des statistiques ont
> été retirés ; le détail des tournois n'est plus lu que pour ceux qui en ont besoin.
>
> **Point 7 : livré** (dépôt BACK, commit `1f716d1`) ; le front l'utilise.

Le front de l'espace joueur fonctionne avec le contrat actuel (`api-routes.md` du dépôt BACK).
Certains besoins y sont couverts par des contournements côté front : ce fichier liste ce qu'il
faudrait ajouter au back pour s'en passer, avec la forme attendue. Formats habituels : réponses en
camelCase, erreurs `{ error: { code, message } }`, listes `{ <liste>, pagination }`.

Une fois une route ajoutée, le fichier du front à modifier est indiqué : rien d'autre ne change.

## 1. Messages lus / non lus (badge « Équipes », pastilles des équipes)

Aujourd'hui : le dernier message lu est gardé dans le navigateur (`localStorage`). Le compte de
non-lus ne suit donc pas le joueur d'un appareil à l'autre, et l'historique déjà présent à la
première visite compte comme lu.

```
GET  /api/me/unread                       → 200 { teams: [{ teamId, unread, lastReadMessageId }] }
POST /api/teams/:id/messages/read  { messageId }   → 204   (membre de l'équipe)
```

- `unread` : messages des autres membres plus récents que `lastReadMessageId`.
- Équipes éliminées ou tournois terminés : absentes de la liste.
- Front : `src/services/readMarkers.ts` et `src/context/NotificationsProvider.tsx`.

## 2. Demandes d'adhésion en temps réel

Aujourd'hui : le badge du capitaine est relu à chaque changement de page ; une nouvelle demande
n'apparaît pas tant qu'il reste sur la même page.

| Événement | Destinataires | Charge utile | Déclencheur |
|---|---|---|---|
| `joinRequest:new` | Capitaine (salon `user:<id>`) | `JoinRequestDto` | Nouvelle demande |
| `joinRequest:updated` | Auteur de la demande (salon `user:<id>`) | `JoinRequestDto` | Acceptée, refusée, annulée à la clôture |

- Front : `src/services/realtime.ts` (type `ServerEvents`) et `src/context/NotificationsProvider.tsx`.

## 3. Mes demandes en attente

Aujourd'hui : le front garde ses propres demandes dans le navigateur. Une demande faite depuis un
autre navigateur n'y apparaît pas (le bouton « Demander à rejoindre » reste actif et le back répond
« Vous avez déjà une demande en attente pour cette équipe »).

```
GET /api/me/join-requests?status=pending   → 200 { joinRequests: JoinRequestDto[] }
```

- Utile aussi : `tournamentId` et `team: { id, name }` dans `JoinRequestDto`.
- Front : `src/services/requestStorage.ts` et `src/context/TournamentsProvider.tsx`.

## 4. Mes équipes

Aujourd'hui : il n'y a pas de route « mes équipes » ; le front charge le détail de chaque tournoi
(`GET /api/tournaments/:id`, une requête par tournoi) pour retrouver celles du joueur.

```
GET /api/me/teams   → 200 { teams: [TeamDto & { tournament: TournamentDto }] }
```

- Front : `src/services/tournaments.ts` (`fetchTournaments`).

## 5. Statistiques du profil (facultatif)

Aujourd'hui : le profil calcule tournois joués, victoires, titres et derniers faits d'armes depuis
les arbres des tournois chargés (100 tournois au plus).

```
GET /api/users/:id/stats  → 200 {
  tournaments, matchesPlayed, matchesWon, titles,
  history: [{ tournament: { id, name, game: { id, name } }, finishedAt,
              result: 'champion' | 'final' | 'semi' | 'quarter' }]
}
```

- Front : `src/utils/profile.ts` et `src/pages/Player/Profile/Profile.tsx`.

## 6. Données de la maquette absentes du contrat (facultatif)

- Horaire prévu des matchs (`scheduledAt` dans `MatchDto`) : compte à rebours du prochain match.
- Date de clôture prévue des inscriptions (`registrationClosesAt` dans `TournamentDto`).
- Équipe ouverte / fermée aux demandes (`visibility: 'open' | 'private'` dans `TeamDto`, modifiable
  par le capitaine) : cadenas de la maquette, badge INCOMPLÈTE.

## 7. Équipes hors tournoi

Demande issue des tests d'Esteban : un joueur crée une équipe sans choisir de tournoi, la compose,
puis l'inscrit depuis son tableau de bord à un tournoi aux inscriptions ouvertes.
Aujourd'hui `teams.tournament_id` est `NOT NULL`.

```
POST /api/teams  { name, gameId }        → 201 { team }   (connecté : il en devient capitaine)
GET  /api/teams?free=true&search=        → 200 { teams: TeamDto[], pagination }   (public)
POST /api/teams/:id/register { tournamentId } → 200 { team }   (capitaine)
```

- `TeamDto` : `tournamentId: number | null` (null : hors tournoi) et `game: { id, name }`, pour toutes
  les équipes (celui du tournoi pour une équipe inscrite).
- `GET /api/me/teams` renvoie aussi mes équipes hors tournoi, avec `tournament: null`.
- `JoinRequestDto.tournamentId` vaut `null` pour une demande vers une équipe hors tournoi.
- Hors tournoi, tout fonctionne comme dans un tournoi aux inscriptions ouvertes : renommer, rôles,
  visibilité, demandes, exclusion, capitanat, départ, suppression, chat (`team:join`).
- `register` : inscriptions ouvertes (`409 REGISTRATION_CLOSED`), même jeu (`409 GAME_MISMATCH`),
  moins de 8 équipes (`409 TOURNAMENT_FULL`), aucun membre déjà dans une équipe du tournoi
  (`409 MEMBER_ALREADY_IN_TOURNAMENT`), nom libre dans le tournoi (`409 TEAM_NAME_TAKEN`), équipe
  pas déjà inscrite (`409 TEAM_ALREADY_REGISTERED`). L'équipe garde son identifiant, ses membres,
  ses messages et ses demandes en attente ; `tournament:updated` est émis.
- Front : `src/services/teams.ts` (`createFreeTeam`, `fetchFreeTeams`, `registerTeam`,
  `fetchMyTeams`).

## Rappel de configuration

L'origine du front doit figurer dans `CORS_ORIGIN` du `.env` du back
(`http://localhost:5173` en dev), sinon la connexion Socket.IO est refusée.
