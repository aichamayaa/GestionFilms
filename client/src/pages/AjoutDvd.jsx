import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAnnuaire, useRetour } from '../utils/hooks.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';
import FormulaireDvd, { VALEURS_VIDES } from '../components/FormulaireDvd.jsx';

export default function AjoutDvd() {
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
      libelle: u._id === utilisateur._id ? `${u.nom} (moi)` : u.nom,
    }));
  }, [estSuper, utilisateurs, utilisateur._id]);

  async function ajouter(donnees) {
    const reponse = await api.ajouterFilm(donnees);
    navigate(retour, { state: { message: `Le DVD « ${reponse.film.titreFrancais} » a été ajouté.` } });
  }

  if (estSuper && chargement) {
    return <Chargement />;
  }

  return (
    <section className="page page-etroite">
      <Alerte type="erreur">{erreur}</Alerte>
      <FormulaireDvd
        titre="Ajout d’un DVD"
        valeursInitiales={{ ...VALEURS_VIDES, pourUtilisateurId: estSuper ? utilisateur._id : '' }}
        libelleBouton="Ajouter le DVD"
        onSoumettre={ajouter}
        onAnnuler={() => navigate(retour)}
        utilisateursCibles={cibles}
      />
    </section>
  );
}
