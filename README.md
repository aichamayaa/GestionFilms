# Film Management / Gestion de films

**[English](#-english) · [Français](#-français)**

**Live demo / Démo en ligne : [https://gestionfilms.vercel.app](https://gestionfilms.vercel.app)**

---

## English

Full-stack web application for managing a DVD collection shared between several users: browsing the catalog, borrowing, claiming films, personal preferences and email notifications.

### Demo account

Sign in with:

- Username: `Chantal`
- Password: `DemoChantal!1`

You can also click **Create an account** to sign up.

> The interface is available in English and French (use the **EN | FR** switch in the header). Your choice is remembered. The demo data (film titles, summaries and user names) is in French.

### Features

- Bilingual interface, English and French, with a language switch
- JWT authentication (sign in and sign up)
- Passwords hashed with bcrypt
- Film catalog with actors, directors and producers
- Borrowing management
- User, superuser and administrator roles
- Per-user preferences (films per page, colors, notifications)
- Email sending over SMTP (Gmail); notification emails are sent in English and French

### Technologies

- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Deployment:** Vercel (client and server in a single project)

### Run the project locally

1. Clone the repository:

   ```
   git clone https://github.com/aichamayaa/GestionFilms.git
   ```

2. Create `server/.env` from `server/.env.example` and fill in the values.
3. Install dependencies and seed the database:

   ```
   cd server
   npm install
   node --env-file=.env src/seed/seed.js
   node --env-file=.env src/index.js
   ```

4. In a second terminal:

   ```
   cd client
   npm install
   npm run dev
   ```

The API starts on `http://localhost:3001`.

### Environment variables

See `server/.env.example`. On Vercel, they are set in *Settings → Environment Variables*.

### Known limitations

- On the online version, uploaded cover images are not kept (Vercel's disk is read-only). The covers from the seed data are included in the project.

### Author

Aicha M. Touré · [https://github.com/aichamayaa](https://github.com/aichamayaa)

---

## Français

Application Web full-stack de gestion d'une collection de DVD partagée entre plusieurs utilisateurs : consultation du catalogue, emprunts, appropriation de films, préférences personnelles et notifications par courriel.

### Compte de démonstration

Connectez-vous avec :

- Nom d'utilisateur : `Chantal`
- Mot de passe : `DemoChantal!1`

Vous pouvez aussi cliquer sur **Créer un compte** pour vous inscrire.

> L'interface est offerte en français et en anglais (utilisez le sélecteur **EN | FR** dans l'en-tête). Votre choix est mémorisé. Les données de démonstration (titres de films, résumés et noms d'utilisateurs) sont en français.

### Fonctionnalités

- Interface bilingue, français et anglais, avec sélecteur de langue
- Authentification JWT (connexion et inscription)
- Mots de passe chiffrés avec bcrypt
- Catalogue de films avec acteurs, réalisateurs et producteurs
- Gestion des emprunts
- Rôles : utilisateur, superutilisateur et administrateur
- Préférences par utilisateur (films par page, couleurs, notifications)
- Envoi de courriels par SMTP (Gmail) ; les courriels de notification sont envoyés en français et en anglais

### Technologies

- **Frontend :** React, Vite, React Router
- **Backend :** Node.js, Express
- **Base de données :** MongoDB Atlas (Mongoose)
- **Déploiement :** Vercel (client et serveur dans un seul projet)

### Exécuter le projet localement

1. Clonez le dépôt :

   ```
   git clone https://github.com/aichamayaa/GestionFilms.git
   ```

2. Créez `server/.env` à partir de `server/.env.example` et remplissez les valeurs.
3. Installez les dépendances et initialisez la base de données :

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

### Variables d'environnement

Voir `server/.env.example`. Sur Vercel, elles se définissent dans *Settings → Environment Variables*.

### Limitations connues

- Sur la version en ligne, les images de couverture téléversées ne sont pas conservées (le disque de Vercel est en lecture seule). Les couvertures des données initiales sont incluses dans le projet.

### Auteure

Aicha M. Touré · [https://github.com/aichamayaa](https://github.com/aichamayaa)
