# Gestion de films

Application web full-stack pour gérer une collection de DVD partagée entre plusieurs utilisateurs : consultation du catalogue, emprunts, appropriation de films, préférences personnelles et notifications par courriel.

**Démo en ligne : https://gestionfilms.vercel.app**

## Compte de démonstration

Connectez-vous avec :

- Identifiant : `[courriel ou prénom d'un utilisateur de donnees.json]`
- Mot de passe : `[son motDePasse dans donnees.json]`

Vous pouvez aussi cliquer sur **Créer un compte** pour vous inscrire.

## Fonctionnalités

- Authentification par jeton JWT (connexion et inscription)
- Mots de passe hachés avec bcrypt
- Catalogue de films avec acteurs, réalisateurs et producteurs
- Gestion des emprunts
- Rôles utilisateur et administrateur
- Préférences par utilisateur (nombre de films par page, couleurs, notifications)
- Envoi de courriels par SMTP (Gmail)

## Technologies

- **Frontend :** React, Vite, React Router
- **Backend :** Node.js, Express
- **Base de données :** MongoDB Atlas (Mongoose)
- **Déploiement :** Vercel (client et serveur dans un seul projet)

## Lancer le projet en local

1. Cloner le dépôt :
   ```
   git clone https://github.com/aichamayaa/GestionFilms.git
   ```
2. Créer `server/.env` à partir de `server/.env.example` et remplir les valeurs.
3. Installer et peupler la base :
   ```
   cd server
   npm install
   node --env-file=.env src/seed/seed.js
   node --env-file=.env src/index.js
   ```
4. Dans un second terminal :
   ```
   cd client
   npm install
   npm run dev
   ```

L'API démarre sur `http://localhost:3001`.

## Variables d'environnement

Voir `server/.env.example`. Sur Vercel, elles se configurent dans *Settings → Environment Variables*.

## Limites connues

- Sur la version en ligne, les pochettes téléversées ne sont pas conservées (le disque de Vercel est en lecture seule). Les pochettes du jeu de données sont incluses dans le projet.

## Auteure

Aicha M. Toure · https://github.com/aichamayaa