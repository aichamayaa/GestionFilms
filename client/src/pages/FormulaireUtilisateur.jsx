import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api, ErreurApi } from '../api/client.js';
import { creationUtilisateurSchema, modificationUtilisateurSchema, validerFormulaire } from '../validation.js';
import Alerte from '../components/Alerte.jsx';
import { Champ } from '../components/Champ.jsx';
import Chargement from '../components/Chargement.jsx';

const VIDE = { nom: '', courriel: '', motDePasse: '', confirmation: '', role: 'U' };

export default function FormulaireUtilisateur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const modification = Boolean(id);
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [chargement, setChargement] = useState(modification);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!modification) {
      return undefined;
    }
    const controleur = new AbortController();
    api
      .obtenirUtilisateur(id, controleur.signal)
      .then((reponse) => {
        const u = reponse.utilisateur;
        setValeurs({ nom: u.nom, courriel: u.courriel, motDePasse: '', confirmation: '', role: u.role });
        setChargement(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') {
          return;
        }
        setErreurGenerale(e.message);
        setChargement(false);
      });
    return () => controleur.abort();
  }, [id, modification]);

  function changer(champ, valeur) {
    setValeurs((v) => ({ ...v, [champ]: valeur }));
    setErreurs((e) => {
      if (!e[champ]) {
        return e;
      }
      const copie = { ...e };
      delete copie[champ];
      return copie;
    });
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreurGenerale('');

    const schema = modification ? modificationUtilisateurSchema : creationUtilisateurSchema;
    const { donnees, erreurs: erreursClient } = validerFormulaire(schema, valeurs);
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      return;
    }

    setErreurs({});
    setEnvoi(true);
    try {
      if (modification) {
        await api.modifierUtilisateur(id, donnees);
      } else {
        await api.creerUtilisateur(donnees);
      }
      navigate('/administration/utilisateurs', {
        state: {
          message: modification
            ? `User ${donnees.nom} was updated.`
            : `User ${donnees.nom} was created. A confirmation email was sent to them.`,
        },
      });
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      } else {
        setErreurGenerale('An unexpected error occurred.');
      }
      setEnvoi(false);
    }
  }

  if (chargement) {
    return <Chargement />;
  }

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>{modification ? 'Edit user' : 'Register a new user'}</h1>
      </div>

      <form className="panneau" onSubmit={soumettre} noValidate>
        <Alerte type="erreur">{erreurGenerale}</Alerte>

        <Champ id="nom" libelle="First name" requis erreur={erreurs.nom} aide="It can be used to sign in and must be unique.">
          <input
            id="nom"
            type="text"
            value={valeurs.nom}
            onChange={(e) => changer('nom', e.target.value)}
            placeholder="User’s first name"
            title="User’s first name"
            maxLength={60}
            autoFocus
            aria-invalid={erreurs.nom ? 'true' : undefined}
          />
        </Champ>

        <Champ id="courriel" libelle="Email address" requis erreur={erreurs.courriel} aide="It can also be used to sign in.">
          <input
            id="courriel"
            type="email"
            value={valeurs.courriel}
            onChange={(e) => changer('courriel', e.target.value)}
            placeholder="name@example.com"
            title="User’s email address"
            maxLength={120}
            aria-invalid={erreurs.courriel ? 'true' : undefined}
          />
        </Champ>

        <Champ id="role" libelle="Role" erreur={erreurs.role}>
          <select id="role" value={valeurs.role} onChange={(e) => changer('role', e.target.value)} title="A superuser can act on behalf of other users">
            <option value="U">User</option>
            <option value="S">Superuser</option>
            {valeurs.role === 'A' && <option value="A">Administrator</option>}
          </select>
        </Champ>

        <Champ
          id="motDePasse"
          libelle={modification ? 'New password' : 'Password'}
          requis={!modification}
          erreur={erreurs.motDePasse}
          aide={modification ? 'Leave blank to keep the current password.' : 'At least 6 characters.'}
        >
          <input
            id="motDePasse"
            type="password"
            value={valeurs.motDePasse}
            onChange={(e) => changer('motDePasse', e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            aria-invalid={erreurs.motDePasse ? 'true' : undefined}
          />
        </Champ>

        <Champ id="confirmation" libelle="Confirm password" requis={!modification} erreur={erreurs.confirmation}>
          <input
            id="confirmation"
            type="password"
            value={valeurs.confirmation}
            onChange={(e) => changer('confirmation', e.target.value)}
            placeholder="Enter it again"
            autoComplete="new-password"
            aria-invalid={erreurs.confirmation ? 'true' : undefined}
          />
        </Champ>

        <div className="formulaire-actions">
          <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
            {envoi ? 'Saving…' : modification ? 'Save changes' : 'Save user'}
          </button>
          <Link to="/administration/utilisateurs" className="bouton bouton-secondaire">
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
