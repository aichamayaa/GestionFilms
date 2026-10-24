# Gestion de films – Projet final

Application Web de gestion des DVDs d’un groupe d’utilisateurs.

- Frontend : React 19, React Router 8, Context API, Zod, CSS
- API : Node.js, Express 5, Mongoose, JWT, bcrypt (bcryptjs), Nodemailer
- Base de données : MongoDB

## Prérequis

- Node.js 22.22 ou plus récent (version LTS)
- MongoDB en fonction sur `mongodb://127.0.0.1:27017` (modifiable dans `server/.env`)

## Installation


- npm install
- npm run installer
- npm run peupler

La commande `npm run peupler` vide la base `gestion_films` et la remplit avec le jeu de données de démarrage (7 utilisateurs, 36 films, acteurs, réalisateurs, producteurs et emprunts).

## Démarrage en développement

- npm run dev

- Client : http://localhost:5173
- API : http://localhost:3001

On peut aussi lancer les deux parties séparément : `npm run dev --prefix server` et `npm run dev --prefix client`.

## Démarrage en mode production

- npm start

Le client est compilé, ensuite l’API sert l’application complète sur http://localhost:3001.

## Comptes de démonstration

Maya Toure	maya@admin.ca	Administrateur	mdp: 222222
Matante Leguire	matante@demo.ca	Utilisateur	mdp: 111111
Issa Mercier    issamer@demo.ca	Utilisateur	mdp:333333	
Mass Aicha Toure maichatoure@yahoo.ca  Superutilisateur mdp: 000000
Olivier Primeau primeau@demo.ca	Utilisateur	mdp: 444444
Catherine Lager	lager@demo.ca	Utilisateur	mdp: 555555
David Guetta	guetta@demo.ca	Utilisateur	mdp: 666666
