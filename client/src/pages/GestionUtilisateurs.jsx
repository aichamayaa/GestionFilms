import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { api } from '../api/client.js';
import { ROLES } from '../constantes.js';
import Alerte from '../components/Alerte.jsx';
import Chargement from '../components/Chargement.jsx';

export default function GestionUtilisateurs() {
  const location = useLocation();
  const navigate = useNavigate();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState(location.state?.message ?? '');
  const [aSupprimer, setASupprimer] = useState(null);
  const [suppression, setSuppression] = useState(false);

  const charger = useCallback((signal) => {
    api
      .listerUtilisateurs(signal)
      .then((reponse) => {
        setUtilisateurs(reponse.utilisateurs);
        setChargement(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') {
          return;
        }
        setErreur(e.message);
        setChargement(false);
      });
  }, []);

  useEffect(() => {
    const controleur = new AbortController();
    charger(controleur.signal);
    return () => controleur.abort();
  }, [charger]);

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  async function supprimer(utilisateur) {
    setSuppression(true);
    setErreur('');
    try {
      await api.supprimerUtilisateur(utilisateur._id);
      setMessage(`L’utilisateur ${utilisateur.nom} a été supprimé.`);
      setASupprimer(null);
      charger();
    } catch (e) {
      setErreur(e.message);
      setASupprimer(null);
    } finally {
      setSuppression(false);
    }
  }

  return (
    <section className="page">
      <div className="page-entete">
        <h1>Gestion des utilisateurs</h1>
        <Link to="/administration/utilisateurs/nouveau" className="bouton bouton-primaire" title="Enregistrer un nouvel utilisateur">
          Ajouter un utilisateur
        </Link>
      </div>

      <Alerte type="succes" onFermer={() => setMessage('')}>
        {message}
      </Alerte>
      <Alerte type="erreur" onFermer={() => setErreur('')}>
        {erreur}
      </Alerte>

      {chargement && <Chargement />}

      {!chargement && (
        <div className="panneau tableau-conteneur">
          <table className="tableau">
            <caption className="sr-seulement">Liste des utilisateurs et des superutilisateurs</caption>
            <thead>
              <tr>
                <th scope="col">N°</th>
                <th scope="col">Prénom</th>
                <th scope="col">Courriel</th>
                <th scope="col">Rôle</th>
                <th scope="col">DVDs possédés</th>
                <th scope="col">DVDs en main</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u, index) => (
                <tr key={u._id}>
                  <td>{index + 1}</td>
                  <td>{u.nom}</td>
                  <td>{u.courriel}</td>
                  <td>{ROLES[u.role]}</td>
                  <td>{u.nbPossedes}</td>
                  <td>{u.nbEnMain}</td>
                  <td>
                    {aSupprimer === u._id ? (
                      <div className="actions-ligne">
                        <span>Supprimer ?</span>
                        <button type="button" className="bouton bouton-petit bouton-danger" onClick={() => supprimer(u)} disabled={suppression}>
                          Confirmer
                        </button>
                        <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => setASupprimer(null)} disabled={suppression}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <div className="actions-ligne">
                        <Link to={`/administration/utilisateurs/${u._id}`} className="bouton bouton-petit bouton-secondaire" title={`Modifier ${u.nom}`}>
                          Modifier
                        </Link>
                        {u.role !== 'A' && (
                          <button type="button" className="bouton bouton-petit bouton-danger-contour" onClick={() => setASupprimer(u._id)} title={`Supprimer ${u.nom}`}>
                            Supprimer
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
