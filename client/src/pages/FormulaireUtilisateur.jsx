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
            ? `L’utilisateur ${donnees.nom} a été modifié.`
            : `L’utilisateur ${donnees.nom} a été enregistré. Un courriel de confirmation lui a été envoyé.`,
        },
      });
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      } else {
        setErreurGenerale('Une erreur inattendue est survenue.');
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
        <h1>{modification ? 'Modification d’un utilisateur' : 'Enregistrement d’un nouvel utilisateur'}</h1>
      </div>

      <form className="panneau" onSubmit={soumettre} noValidate>
        <Alerte type="erreur">{erreurGenerale}</Alerte>

        <Champ id="nom" libelle="Prénom" requis erreur={erreurs.nom} aide="Il peut servir d’identifiant de connexion et doit être unique.">
          <input
            id="nom"
            type="text"
            value={valeurs.nom}
            onChange={(e) => changer('nom', e.target.value)}
            placeholder="Prénom de l’utilisateur"
            title="Prénom de l’utilisateur"
            maxLength={60}
            autoFocus
            aria-invalid={erreurs.nom ? 'true' : undefined}
          />
        </Champ>

        <Champ id="courriel" libelle="Adresse courriel" requis erreur={erreurs.courriel} aide="Elle peut aussi servir d’identifiant de connexion.">
          <input
            id="courriel"
            type="email"
            value={valeurs.courriel}
            onChange={(e) => changer('courriel', e.target.value)}
            placeholder="nom@exemple.ca"
            title="Adresse courriel de l’utilisateur"
            maxLength={120}
            aria-invalid={erreurs.courriel ? 'true' : undefined}
          />
        </Champ>

        <Champ id="role" libelle="Rôle" erreur={erreurs.role}>
          <select id="role" value={valeurs.role} onChange={(e) => changer('role', e.target.value)} title="Un superutilisateur peut agir pour les autres utilisateurs">
            <option value="U">Utilisateur</option>
            <option value="S">Super utilisateur</option>
            {valeurs.role === 'A' && <option value="A">Administrateur</option>}
          </select>
        </Champ>

        <Champ
          id="motDePasse"
          libelle={modification ? 'Nouveau mot de passe' : 'Mot de passe'}
          requis={!modification}
          erreur={erreurs.motDePasse}
          aide={modification ? 'Laissez vide pour conserver le mot de passe actuel.' : 'Au moins 6 caractères.'}
        >
          <input
            id="motDePasse"
            type="password"
            value={valeurs.motDePasse}
            onChange={(e) => changer('motDePasse', e.target.value)}
            placeholder="Mot de passe"
            autoComplete="new-password"
            aria-invalid={erreurs.motDePasse ? 'true' : undefined}
          />
        </Champ>

        <Champ id="confirmation" libelle="Confirmation du mot de passe" requis={!modification} erreur={erreurs.confirmation}>
          <input
            id="confirmation"
            type="password"
            value={valeurs.confirmation}
            onChange={(e) => changer('confirmation', e.target.value)}
            placeholder="Saisissez-le une seconde fois"
            autoComplete="new-password"
            aria-invalid={erreurs.confirmation ? 'true' : undefined}
          />
        </Champ>

        <div className="formulaire-actions">
          <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
            {envoi ? 'Enregistrement…' : modification ? 'Enregistrer les modifications' : 'Enregistrer l’utilisateur'}
          </button>
          <Link to="/administration/utilisateurs" className="bouton bouton-secondaire">
            Annuler
          </Link>
        </div>
      </form>
    </section>
  );
}
