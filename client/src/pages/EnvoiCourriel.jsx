import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { api, ErreurApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { messageSchema, validerFormulaire } from '../validation.js';
import { useAnnuaire } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import { CaseACocher, Champ, Groupe } from '../components/Champ.jsx';
import { useTranslation } from 'react-i18next';

export default function EnvoiCourriel() {
  const { t } = useTranslation();
  const { utilisateur } = useAuth();
  const [params] = useSearchParams();
  const { utilisateurs, erreur: erreurAnnuaire } = useAnnuaire();
  const destinataireInitial = params.get('a') ?? '';

  const [mode, setMode] = useState('un');
  const [unDestinataire, setUnDestinataire] = useState(destinataireInitial);
  const [plusieurs, setPlusieurs] = useState([]);
  const [sujet, setSujet] = useState(params.get('objet') ?? '');
  const [corps, setCorps] = useState('');
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);

  const autres = utilisateurs.filter((u) => u._id !== utilisateur._id);

  useEffect(() => {
    setUnDestinataire(destinataireInitial);
  }, [destinataireInitial]);

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreurGenerale('');

    const charge = {
      destinataires: mode === 'un' ? (unDestinataire ? [unDestinataire] : []) : mode === 'plusieurs' ? plusieurs : [],
      tous: mode === 'tous',
      sujet,
      corps,
    };

    const { donnees, erreurs: erreursClient } = validerFormulaire(messageSchema, charge);
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      return;
    }

    setErreurs({});
    setEnvoi(true);
    try {
      const reponse = await api.envoyerCourriel(donnees);
      setResultat(reponse);
    } catch (e) {
      if (e instanceof ErreurApi) {
        setErreurs(e.erreurs);
        setErreurGenerale(e.message);
      }
    } finally {
      setEnvoi(false);
    }
  }

  function basculerPlusieurs(id) {
    setPlusieurs((liste) => (liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id]));
  }

  function nouveauMessage() {
    setResultat(null);
    setSujet('');
    setCorps('');
    setPlusieurs([]);
    setUnDestinataire('');
  }

  if (resultat) {
    const { envoi: courriel, simulation } = resultat;
    return (
      <section className="page page-etroite">
        <div className="page-entete">
          <h1>{t('compose.sentTitle')}</h1>
        </div>
        <Alerte type={courriel.statut === 'echec' ? 'erreur' : 'succes'}>
          {courriel.statut === 'echec'
            ? t('compose.rejected')
            : simulation
              ? t('compose.simulated')
              : t('compose.sent')}
        </Alerte>
        <div className="panneau courriel-apercu">
          <dl className="fiche-donnees">
            <div className="fiche-ligne">
              <dt>{t('compose.recipientsLabel')}</dt>
              <dd>{courriel.destinataires.map((d) => `${d.nom} <${d.courriel}>`).join(', ')}</dd>
            </div>
            <div className="fiche-ligne">
              <dt>{t('common.subject')}</dt>
              <dd>{courriel.sujet}</dd>
            </div>
            <div className="fiche-ligne">
              <dt>{t('common.message')}</dt>
              <dd>
                <pre className="courriel-corps">{courriel.corps}</pre>
              </dd>
            </div>
          </dl>
        </div>
        <div className="formulaire-actions">
          <button type="button" className="bouton bouton-primaire" onClick={nouveauMessage}>
            {t('compose.another')}
          </button>
          <Link to="/courriels" className="bouton bouton-secondaire">
            {t('compose.viewSent')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-etroite">
      <div className="page-entete">
        <h1>{t('compose.title')}</h1>
      </div>

      <form className="panneau" onSubmit={soumettre} noValidate>
        <Alerte type="erreur">{erreurGenerale || erreurAnnuaire}</Alerte>

        <Champ id="mode" libelle={t('compose.recipients')}>
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)} title={t('compose.recipientsTitle')}>
            <option value="un">{t('compose.one')}</option>
            <option value="plusieurs">{t('compose.several')}</option>
            <option value="tous">{t('compose.all')}</option>
          </select>
        </Champ>

        {mode === 'un' && (
          <Champ id="destinataire" libelle={t('compose.user')} erreur={erreurs.destinataires}>
            <select
              id="destinataire"
              value={unDestinataire}
              onChange={(e) => setUnDestinataire(e.target.value)}
              title={t('compose.userTitle')}
              aria-invalid={erreurs.destinataires ? 'true' : undefined}
            >
              <option value="">{t('compose.chooseUser')}</option>
              {autres.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.nom}
                </option>
              ))}
            </select>
          </Champ>
        )}

        {mode === 'plusieurs' && (
          <Groupe libelle={t('compose.users')} erreur={erreurs.destinataires}>
            <div className="cases-grille">
              {autres.map((u) => (
                <CaseACocher
                  key={u._id}
                  id={`dest-${u._id}`}
                  libelle={u.nom}
                  coche={plusieurs.includes(u._id)}
                  onChange={() => basculerPlusieurs(u._id)}
                />
              ))}
            </div>
            <div className="formulaire-actions">
              <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setPlusieurs(autres.map((u) => u._id))}>
                {t('compose.selectAll')}
              </button>
              <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setPlusieurs([])}>
                {t('compose.deselectAll')}
              </button>
            </div>
          </Groupe>
        )}

        {mode === 'tous' && <p className="aide">{t('compose.allNote')}</p>}

        <Champ id="sujet" libelle={t('compose.subject')} requis erreur={erreurs.sujet}>
          <input
            id="sujet"
            type="text"
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder={t('compose.subjectPh')}
            title={t('compose.subjectTitle')}
            maxLength={150}
            aria-invalid={erreurs.sujet ? 'true' : undefined}
          />
        </Champ>

        <Champ id="corps" libelle={t('compose.body')} requis erreur={erreurs.corps}>
          <textarea
            id="corps"
            rows={8}
            value={corps}
            onChange={(e) => setCorps(e.target.value)}
            placeholder={t('compose.bodyPh')}
            title={t('compose.bodyTitle')}
            maxLength={5000}
            aria-invalid={erreurs.corps ? 'true' : undefined}
          />
        </Champ>

        <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
          {envoi ? t('compose.sending') : t('compose.send')}
        </button>
      </form>
    </section>
  );
}
