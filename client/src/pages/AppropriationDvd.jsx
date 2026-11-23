import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAnnuaire, useFilm, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import { Champ } from '../components/Champ.jsx';
import Chargement from '../components/Chargement.jsx';
import DetailsDvd from '../components/DetailsDvd.jsx';
import { Trans, useTranslation } from 'react-i18next';

export default function AppropriationDvd() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const retour = useRetour();
  const { utilisateur, estSuper } = useAuth();
  const { film, erreur, chargement } = useFilm(id);
  const { utilisateurs } = useAnnuaire(estSuper);
  const [nouveauDetenteurId, setNouveauDetenteurId] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreurAction, setErreurAction] = useState('');

  useEffect(() => {
    if (!estSuper || !film || nouveauDetenteurId) {
      return;
    }
    const parDefaut = film.detenteur?._id === utilisateur._id ? '' : utilisateur._id;
    setNouveauDetenteurId(parDefaut);
  }, [estSuper, film, utilisateur._id, nouveauDetenteurId]);

  const detenteurActuelId = film?.detenteur?._id ?? '';
  const cible = estSuper ? nouveauDetenteurId : utilisateur._id;
  const nomCible = estSuper
    ? utilisateurs.find((u) => u._id === nouveauDetenteurId)?.nom
    : utilisateur.nom;
  const peutConfirmer = Boolean(cible) && cible !== detenteurActuelId;

  async function confirmer() {
    setEnvoi(true);
    setErreurAction('');
    try {
      await api.approprierFilm(id, estSuper ? { nouveauDetenteurId } : {});
      navigate(retour, {
        state: { message: t('claim.success', { titre: film.titreFrancais, nom: nomCible }) },
      });
    } catch (e) {
      setErreurAction(e.message);
      setEnvoi(false);
    }
  }

  return (
    <section className="page page-etroite">
      {chargement && <Chargement />}
      <Alerte type="erreur">{erreur}</Alerte>
      {film && !film.permissions.approprier && <Alerte type="erreur">{t('claim.forbidden')}</Alerte>}
      {film && (
        <>
          <DetailsDvd film={film} />
          {film.permissions.approprier && (
            <div className="panneau confirmation">
              <h2>{t('claim.heading')}</h2>
              {estSuper ? (
                <>
                  <p>
                    <Trans i18nKey="claim.superText" values={{ nom: film.detenteur?.nom ?? t('common.nobodyLower') }} components={{ 1: <strong /> }} />
                  </p>
                  <Champ id="nouveauDetenteur" libelle={t('claim.newHolder')} aide={t('claim.newHolderHelp')}>
                    <select
                      id="nouveauDetenteur"
                      value={nouveauDetenteurId}
                      onChange={(e) => setNouveauDetenteurId(e.target.value)}
                      title={t('claim.newHolderTitle')}
                    >
                      <option value="">{t('claim.chooseMember')}</option>
                      {utilisateurs
                        .filter((u) => u._id !== detenteurActuelId)
                        .map((u) => (
                          <option key={u._id} value={u._id}>
                            {u._id === utilisateur._id ? t('add.me', { nom: u.nom }) : u.nom}
                          </option>
                        ))}
                    </select>
                  </Champ>
                </>
              ) : (
                <p>
                  <Trans
                    i18nKey="claim.userText"
                    values={{ titre: film.titreFrancais, nom: film.detenteur?.nom ?? t('common.nobodyLower') }}
                    components={{ 1: <strong /> }}
                  />
                </p>
              )}
              <Alerte type="erreur">{erreurAction}</Alerte>
              <div className="formulaire-actions">
                <button type="button" className="bouton bouton-primaire" onClick={confirmer} disabled={envoi || !peutConfirmer}>
                  {envoi ? t('common.saving') : t('claim.confirm')}
                </button>
                <button type="button" className="bouton bouton-secondaire" onClick={() => navigate(retour)} disabled={envoi}>
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {!chargement && !film && (
        <Link to={retour} className="bouton bouton-secondaire">
          {t('common.backToList')}
        </Link>
      )}
    </section>
  );
}
