# Arch Rivals — Front

Front de la plateforme de tournois Arch Rivals (R5A5, sujet B) : page d'accueil, connexion /
inscription et espace joueur (tournois, équipes, salle du conseil, profil).

Le back est dans le dépôt `R5A5_2026_SUJETB_AUSOUSSEAU_PEREIRA_BACK` ; son contrat d'API est dans
son `api-routes.md`.

## Stack

React 19, TypeScript, Vite, React Router, CSS Modules, Socket.IO (client), oxlint.

## Lancer le projet

Prérequis : Node.js 22, et le back lancé sur `http://localhost:3000`.

1. Dans le `.env` du back, `CORS_ORIGIN` doit contenir `http://localhost:5173`, sinon la connexion
   temps réel est refusée.
2. Puis, côté front :

```bash
cd arch-rivals-front
npm install
npm run dev        # http://localhost:5173
```

En dev, Vite redirige `/api` et `/socket.io` vers le back (`vite.config.ts`). Pour un build de
production, définir `VITE_API_URL` (URL de l'API, ex. `https://api.exemple.fr/api`).

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification des types puis build dans `dist/` |
| `npm run lint` | oxlint |
| `npm run format` | Mise en forme Prettier (`npm run format:check` pour vérifier) |

## Pages

| Route | Contenu |
|---|---|
| `/` | Accueil, connexion et inscription |
| `/tournois` | Recherche des tournois par état, ouverte à tous |
| `/tournois/:id` | Avancement d'un tournoi, son arbre et ses paris en Écus, en direct, ouvert à tous |
| `/paris` | Meilleurs parieurs de la semaine, tous tournois (aussi `/joueur/paris`) |
| `/joueur/tournois` | Tournois par état, prochain match, créer ou rejoindre une équipe |
| `/joueur/tournois/:id` | Détail d'un tournoi et son arbre, mis à jour en direct |
| `/joueur/equipes` | Mes équipes (fiche, gestion du capitaine, salle du conseil) et toutes les équipes |
| `/joueur/profil` | Statistiques, derniers faits d'armes, déconnexion |
| `/admin/tournois` | Administration : tournois par état, création d'un tournoi |
| `/admin/tournois/:id` | Clôture, lancement, résultats, forfaits, horaires, salles du conseil des équipes |
| `/admin/jeux` | Jeux et rôles, création d'un jeu |

Les pages publiques ne demandent pas de compte. L'espace joueur (`/joueur/*`) demande d'être
connecté ; l'administration (`/admin/*`) est réservée au compte administrateur (créé par
`npm run seed:admin` côté back), qui y accède par le lien « Administration » de l'en-tête. Le front
ne fait que masquer les écrans : c'est le back qui refuse les actions (403).

## Organisation du code (`arch-rivals-front/src`)

| Dossier | Rôle |
|---|---|
| `pages/` | Une page par route : lit l'URL, assemble les composants |
| `components/` | Composants d'affichage, rangés par domaine (`tournaments/`, `teams/`, `layout/`…) |
| `hooks/` | Logique applicative : chargement, actions, état dérivé |
| `context/` | Données partagées : session, tournois, notifications, toasts |
| `services/` | Accès au back : appels HTTP (`api.ts`), DTO et mappers, temps réel (`realtime.ts`) |
| `types/`, `utils/` | Types du front et fonctions pures |

Les formes JSON du back ne sont connues que de `services/dto.ts` et `services/mappers.ts`.

## Autres documents

- `arch-rivals-front/docs/design/` : maquettes HTML.

AUSOUSSEAU Teddy & PEREIRA Esteban
