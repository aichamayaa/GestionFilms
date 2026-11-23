import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api, ErreurApi } from '../api/client.js';
import { creationUtilisateurSchema, modificationUtilisateurSchema, validerFormulaire } from '../validation.js';
import Alerte from '../components/Alerte.jsx';
import { Champ } from '../components/Champ.jsx';
import Chargement from '../components/Chargement.jsx';
import { useTranslation } from 'react-i18next';

const VIDE = { nom: '', courriel: '', motDePasse: '', confirmation: '', role: 'U' };

export default function FormulaireUtilisateur() {
  const { t } = useTranslation();
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
            ? t('admin.updated', { nom: donnees.nom })
            : t('admin.created', { nom: donnees.nom }),
        },
      });
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      } else {
        setErreurGenerale(t('common.unexpected'));
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
        <h1>{modification ? t('admin.editUser') : t('admin.newUser')}</h1>
      </div>

      <form className="panneau" onSubmit={soumettre} noValidate>
        <Alerte type="erreur">{erreurGenerale}</Alerte>

        <Champ id="nom" libelle={t('admin.firstName')} requis erreur={erreurs.nom} aide={t('admin.firstNameHelp')}>
          <input
            id="nom"
            type="text"
            value={valeurs.nom}
            onChange={(e) => changer('nom', e.target.value)}
            placeholder={t('admin.firstNamePh')}
            title={t('admin.firstNamePh')}
            maxLength={60}
            autoFocus
            aria-invalid={erreurs.nom ? 'true' : undefined}
          />
        </Champ>

        <Champ id="courriel" libelle={t('admin.emailAddress')} requis erreur={erreurs.courriel} aide={t('admin.emailHelp')}>
          <input
            id="courriel"
            type="email"
            value={valeurs.courriel}
            onChange={(e) => changer('courriel', e.target.value)}
            placeholder="name@example.com"
            title={t('admin.emailTitle')}
            maxLength={120}
            aria-invalid={erreurs.courriel ? 'true' : undefined}
          />
        </Champ>

        <Champ id="role" libelle={t('admin.role')} erreur={erreurs.role}>
          <select id="role" value={valeurs.role} onChange={(e) => changer('role', e.target.value)} title={t('admin.roleTitle')}>
            <option value="U">{t('roles.U')}</option>
            <option value="S">{t('roles.S')}</option>
            {valeurs.role === 'A' && <option value="A">{t('roles.A')}</option>}
          </select>
        </Champ>

        <Champ
          id="motDePasse"
          libelle={modification ? t('admin.newPassword') : t('admin.password')}
          requis={!modification}
          erreur={erreurs.motDePasse}
          aide={modification ? t('admin.passwordHelpEdit') : t('admin.passwordHelpNew')}
        >
          <input
            id="motDePasse"
            type="password"
            value={valeurs.motDePasse}
            onChange={(e) => changer('motDePasse', e.target.value)}
            placeholder={t('admin.password')}
            autoComplete="new-password"
            aria-invalid={erreurs.motDePasse ? 'true' : undefined}
          />
        </Champ>

        <Champ id="confirmation" libelle={t('admin.confirmPassword')} requis={!modification} erreur={erreurs.confirmation}>
          <input
            id="confirmation"
            type="password"
            value={valeurs.confirmation}
            onChange={(e) => changer('confirmation', e.target.value)}
            placeholder={t('admin.confirmPh')}
            autoComplete="new-password"
            aria-invalid={erreurs.confirmation ? 'true' : undefined}
          />
        </Champ>

        <div className="formulaire-actions">
          <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
            {envoi ? t('common.saving') : modification ? t('admin.saveChanges') : t('admin.saveUser')}
          </button>
          <Link to="/administration/utilisateurs" className="bouton bouton-secondaire">
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </section>
  );
}
