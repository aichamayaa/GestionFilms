import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAnnuaire, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import FormulaireDvd, { VALEURS_VIDES } from '../components/FormulaireDvd.jsx';
import { useTranslation } from 'react-i18next';

export default function AjoutDvd() {
  const { t } = useTranslation();
  const { utilisateur, estSuper } = useAuth();
  const navigate = useNavigate();
  const retour = useRetour();
  const { utilisateurs, chargement, erreur } = useAnnuaire(estSuper);

  const cibles = useMemo(() => {
    if (!estSuper) {
      return null;
    }
    return utilisateurs.map((u) => ({
      _id: u._id,
      libelle: u._id === utilisateur._id ? t('add.me', { nom: u.nom }) : u.nom,
    }));
  }, [estSuper, utilisateurs, utilisateur._id, t]);

  async function ajouter(donnees) {
    const reponse = await api.ajouterFilm(donnees);
    navigate(retour, { state: { message: t('add.success', { titre: reponse.film.titreFrancais }) } });
  }

  if (estSuper && chargement) {
    return <Chargement />;
  }

  return (
    <section className="page page-etroite">
      <Alerte type="erreur">{erreur}</Alerte>
      <FormulaireDvd
        titre={t('add.title')}
        valeursInitiales={{ ...VALEURS_VIDES, pourUtilisateurId: estSuper ? utilisateur._id : '' }}
        libelleBouton={t('add.button')}
        onSoumettre={ajouter}
        onAnnuler={() => navigate(retour)}
        utilisateursCibles={cibles}
      />
    </section>
  );
}
