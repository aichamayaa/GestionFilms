# Film Management

Full-stack web application for managing a DVD collection shared between several users: browsing the catalog, borrowing, claiming films, personal preferences and email notifications.

**Live demo: https://gestionfilms.vercel.app**

## Demo account

Sign in with:

- Username: `Chantal`
- Password: `DemoChantal!1`

You can also click **Create an account** to sign up.

> The demo data (film titles, summaries and user names) is in French. The interface itself is in English.

## Features

- JWT authentication (sign in and sign up)
- Passwords hashed with bcrypt
- Film catalog with actors, directors and producers
- Borrowing management
- User, superuser and administrator roles
- Per-user preferences (films per page, colors, notifications)
- Email sending over SMTP (Gmail)

## Technologies

- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas (Mongoose)
- **Deployment:** Vercel (client and server in a single project)

## Run the project locally

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

## Environment variables

See `server/.env.example`. On Vercel, they are set in *Settings → Environment Variables*.

## Known limitations

- On the online version, uploaded cover images are not kept (Vercel's disk is read-only). The covers from the seed data are included in the project.

## Author

Aicha M. Touré · https://github.com/aichamayaa
