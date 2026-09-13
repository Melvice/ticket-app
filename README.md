# Ticket App

Application de gestion de tickets développée dans le cadre d'un exercice de recrutement.

- **Frontend** : React + TypeScript (Vite)
- **Backend** : Node.js + Express + TypeScript
- **Stockage** : en mémoire (aucune base de données), réinitialisé à chaque redémarrage du serveur

## Installation et démarrage

Deux applications séparées (`backend/` et `frontend/`), à lancer chacune dans un terminal.

### Backend

```bash
cd backend
npm install
npm run dev
```

Le serveur démarre sur `http://localhost:4000`
Autres scripts utiles :

```bash
npm test        # lance la suite de tests (Vitest + Supertest)
npm run build   # compile en JS dans dist/
npm start       # lance la version compilée (après npm run build)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173` (port par défaut de Vite) et appelle l'API sur `http://localhost:4000` (voir `frontend/src/api/tickets.ts`).

Le backend doit être démarré en premier pour que la liste des tickets se charge.

## Choix techniques

- **Express 5 + TypeScript** pour le backend : simple, peu de boilerplate, suffisant pour une API en mémoire.
- **Zod** pour la validation des payloads (`backend/src/routes/tickets.ts`) : TypeScript ne valide rien à l'exécution, donc les données reçues par l'API (titre, statut) sont vérifiées explicitement avant d'atteindre la logique métier. Une requête invalide renvoie `400` avec le détail des erreurs de champ.
- **Store en mémoire** (`backend/src/store.ts`) isolé derrière un petit module (`ticketStore`) plutôt que manipulé directement dans les routes, pour garder les routes fines et pouvoir réinitialiser les données facilement dans les tests (`ticketStore.reset()`).
- **`createApp()` séparé de `index.ts`** : l'app Express est construite dans `app.ts` et démarrée (`listen`) dans `index.ts`, ce qui permet de tester l'app avec Supertest sans ouvrir de vrai port réseau.
- **Vitest + Supertest** pour les tests backend : tests d'intégration sur les routes (codes HTTP, validation, recherche, cycle de vie d'un ticket) plutôt que des tests unitaires isolés, car c'est le comportement de l'API qui compte pour ce cas d'usage.
- **Pas de librairie de fetching côté frontend** (pas de React Query/SWR) : un hook `useTickets` fait maison suffit pour ce périmètre (chargement, erreur, mise à jour optimiste locale) sans ajouter de dépendance ni de complexité inutile.
- **Mise à jour locale de l'état après création/modification/suppression** (`addTicket`/`replaceTicket`/`removeTicket` dans `useTickets`) plutôt qu'un rechargement complet de la liste à chaque action, pour une UI plus réactive ; en cas d'échec d'une action, on retombe sur un rechargement complet (`reload()`) pour rester cohérent avec le serveur.
- **CSS simple sans framework** : le sujet ne demande pas de travail visuel particulier, l'objectif était une interface lisible et fonctionnelle plutôt qu'un design abouti.

## Fonctionnalités

### Requises

- Consulter la liste des tickets (titre, statut, date de création), avec état de chargement, état d'erreur (avec bouton « Réessayer ») et état vide (« Aucun ticket pour le moment »).
- Créer un ticket à partir d'un titre obligatoire (validation côté client et côté serveur), avec état « création en cours » et affichage de l'erreur en cas d'échec ; la liste se met à jour sans rechargement de page.
- Backend : données en mémoire avec quelques tickets initiaux, routes `GET`/`POST` sur `/api/tickets`, validation des entrées, codes HTTP cohérents (`200`, `201`, `400`, `404`).

### Ajouts optionnels réalisés
- Suppression d'un ticket (`DELETE /api/tickets/:id`).
- Tests automatisés backend (`backend/test/tickets.test.ts`) couvrant les 4 routes, les cas de validation et les codes HTTP.

## Ce qui reste incomplet / pistes d'amélioration

- **Recherche non branchée côté UI** : l'endpoint et la fonction `fetchTickets(search)` existent, mais aucun champ de recherche n'est encore affiché dans le frontend. À faire : ajouter un input contrôlé, avec un debounce, relié à `useTickets`.
- **Pas de pagination** : tous les tickets sont chargés d'un coup ; suffisant pour ce volume de données mais à revoir si la liste devait grossir.
- **Pas de tests frontend** : seul le backend est testé automatiquement. À faire : tests de composants (React Testing Library) sur `TicketForm` et `TicketList` (soumission, états d'erreur/chargement, rendu de la liste).
- **Gestion d'erreurs réseau basique côté frontend** : les messages d'erreur sont génériques (`HTTP <code>`) sauf pour la création, qui remonte le détail renvoyé par Zod ; on pourrait harmoniser ce traitement pour toutes les requêtes.
- **Pas de CI/CD** : les tests s'exécutent uniquement en local pour le moment. À faire : un workflow GitHub Actions qui installe les dépendances et lance `npm test` (backend) sur chaque push/PR.

## Utilisation de l'IA

- **Outil utilisé** : Claude Code.
- **Tâches pour lesquelles il a aidé** : logique métier côté backend (validation Zod, store en mémoire), écriture des tests automatisés (Vitest/Supertest) et css basique, ainsi que la rédaction de ce README.
- **Ce qui a été fait personnellement** : Architecture du code, chaque partie du code a été relue ligne par ligne avant d'être acceptée; des ajustements de logique et de nommage ont été apportés par rapport aux suggestions initiales ; l'application a aussi été testée manuellement (endpoints et interface) en plus de l'exécution de la suite de tests automatisés.
