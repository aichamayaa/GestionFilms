import { useEffect, useRef, useState } from 'react';
import { api, ErreurApi } from '../api/client.js';
import { CATEGORIES, FORMATS, LANGUES, SUPPLEMENTS } from '../constantes.js';
import { ajoutFilmSchema, validerFormulaire } from '../validation.js';
import { urlPochette } from '../utils/format.js';
import Alerte from './Alerte.jsx';
import { CaseACocher, Champ, Groupe } from './Champ.jsx';

export const VALEURS_VIDES = {
  titreFrancais: '',
  titreOriginal: '',
  anneeSortie: '',
  categorie: '',
  format: '',
  langues: [],
  sousTitres: [],
  supplements: [],
  resume: '',
  dureeMinutes: '',
  nbDisques: '',
  dvdOriginal: false,
  versionEtendue: false,
  visibleATous: true,
  imagePochette: '',
  acteurs: ['', '', ''],
  realisateur: '',
  producteur: '',
  pourUtilisateurId: '',
};

export function valeursDepuisFilm(film) {
  const acteurs = film.acteurs.map((a) => a.nom);
  while (acteurs.length < 3) {
    acteurs.push('');
  }
  return {
    titreFrancais: film.titreFrancais,
    titreOriginal: film.titreOriginal ?? '',
    anneeSortie: film.anneeSortie ?? '',
    categorie: film.categorie ?? '',
    format: film.format ?? '',
    langues: film.langues ?? [],
    sousTitres: film.sousTitres ?? [],
    supplements: film.supplements ?? [],
    resume: film.resume ?? '',
    dureeMinutes: film.dureeMinutes ?? '',
    nbDisques: film.nbDisques ?? '',
    dvdOriginal: film.dvdOriginal === true,
    versionEtendue: film.versionEtendue === true,
    visibleATous: film.visibleATous !== false,
    imagePochette: film.imagePochette ?? '',
    acteurs: acteurs.slice(0, 3),
    realisateur: film.realisateur?.nom ?? '',
    producteur: film.producteur?.nom ?? '',
    pourUtilisateurId: '',
  };
}

function basculer(liste, valeur) {
  return liste.includes(valeur) ? liste.filter((v) => v !== valeur) : [...liste, valeur];
}

export default function FormulaireDvd({
  titre,
  valeursInitiales,
  libelleBouton,
  onSoumettre,
  onAnnuler,
  utilisateursCibles,
  informationPourQui,
}) {
  const [valeurs, setValeurs] = useState(valeursInitiales);
  const [erreurs, setErreurs] = useState({});
  const [erreurGenerale, setErreurGenerale] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [televersement, setTeleversement] = useState(false);
  const [personnes, setPersonnes] = useState({ acteurs: [], realisateurs: [], producteurs: [] });
  const formulaire = useRef(null);

  useEffect(() => {
    const controleur = new AbortController();
    api
      .personnes(controleur.signal)
      .then(setPersonnes)
      .catch(() => {});
    return () => controleur.abort();
  }, []);

  useEffect(() => {
    if (Object.keys(erreurs).length === 0) {
      return;
    }
    const premier = formulaire.current?.querySelector('[aria-invalid="true"]');
    if (premier) {
      premier.focus();
      premier.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [erreurs]);

  function changer(champ, valeur) {
    setErreurGenerale('');
    setValeurs((precedentes) => ({ ...precedentes, [champ]: valeur }));
    setErreurs((precedentes) => {
      if (!precedentes[champ]) {
        return precedentes;
      }
      const copie = { ...precedentes };
      delete copie[champ];
      return copie;
    });
  }

  function changerActeur(index, valeur) {
    const acteurs = [...valeurs.acteurs];
    acteurs[index] = valeur;
    changer('acteurs', acteurs);
  }

  async function choisirImage(evenement) {
    const fichier = evenement.target.files?.[0];
    evenement.target.value = '';
    if (!fichier) {
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(fichier.type)) {
      setErreurs((e) => ({ ...e, imagePochette: 'Choisissez une image JPEG, PNG, WebP ou GIF.' }));
      return;
    }
    if (fichier.size > 2 * 1024 * 1024) {
      setErreurs((e) => ({ ...e, imagePochette: 'L’image ne doit pas dépasser 2 Mo.' }));
      return;
    }
    setTeleversement(true);
    try {
      const reponse = await api.televerserPochette(fichier);
      changer('imagePochette', reponse.nomFichier);
    } catch (erreur) {
      setErreurs((e) => ({ ...e, imagePochette: erreur.message }));
    } finally {
      setTeleversement(false);
    }
  }

  async function soumettre(evenement) {
    evenement.preventDefault();
    setErreurGenerale('');

    const { donnees, erreurs: erreursClient } = validerFormulaire(ajoutFilmSchema, valeurs);
    if (Object.keys(erreursClient).length > 0) {
      setErreurs(erreursClient);
      setErreurGenerale('Le formulaire contient des erreurs. Corrigez les champs en rouge.');
      return;
    }

    setErreurs({});
    setEnvoi(true);
    try {
      await onSoumettre(donnees);
    } catch (erreur) {
      if (erreur instanceof ErreurApi) {
        setErreurs(erreur.erreurs);
        setErreurGenerale(erreur.message);
      } else {
        setErreurGenerale('Une erreur inattendue est survenue.');
      }
      setEnvoi(false);
    }
  }

  const supplementsAtteints = valeurs.supplements.length >= 3;
  const urlImage = urlPochette(valeurs.imagePochette);

  return (
    <form ref={formulaire} className="panneau formulaire-dvd" onSubmit={soumettre} noValidate>
      <h1 className="formulaire-titre">{titre}</h1>
      <p className="aide">Les champs marqués d’un astérisque (*) sont obligatoires. Seul le titre français est requis.</p>

      {informationPourQui && <Alerte type="info">{informationPourQui}</Alerte>}
      <Alerte type="erreur">{erreurGenerale}</Alerte>

      {utilisateursCibles && (
        <Champ id="pourUtilisateurId" libelle="Ajouter ce DVD pour" erreur={erreurs.pourUtilisateurId} aide="En tant que superutilisateur, vous indiquez pour qui vous effectuez l’opération.">
          <select
            id="pourUtilisateurId"
            value={valeurs.pourUtilisateurId}
            onChange={(e) => changer('pourUtilisateurId', e.target.value)}
            title="Utilisateur qui sera propriétaire et détenteur du DVD"
          >
            {utilisateursCibles.map((u) => (
              <option key={u._id} value={u._id}>
                {u.libelle}
              </option>
            ))}
          </select>
        </Champ>
      )}

      <div className="formulaire-grille">
        <div className="formulaire-image">
          <div className="apercu-pochette">
            {urlImage ? (
              <img src={urlImage} alt="Aperçu de la pochette" />
            ) : (
              <span>Aucune pochette</span>
            )}
          </div>
          <Champ id="imagePochette" libelle="Image de la pochette" erreur={erreurs.imagePochette} aide="JPEG, PNG, WebP ou GIF, 2 Mo au maximum.">
            <input
              id="imagePochette"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={choisirImage}
              disabled={televersement}
              aria-invalid={erreurs.imagePochette ? 'true' : undefined}
              title="Choisir une image pour la pochette du DVD"
            />
          </Champ>
          {televersement && <p className="aide">Téléversement en cours…</p>}
          {valeurs.imagePochette && (
            <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => changer('imagePochette', '')}>
              Retirer l’image
            </button>
          )}
        </div>

        <div className="formulaire-champs">
          <Champ id="titreFrancais" libelle="Titre français" requis erreur={erreurs.titreFrancais}>
            <input
              id="titreFrancais"
              type="text"
              value={valeurs.titreFrancais}
              onChange={(e) => changer('titreFrancais', e.target.value)}
              placeholder="Ex. : Le Sillage du Nord"
              title="Titre affiché dans la liste. Deux DVDs ne peuvent pas avoir le même titre."
              maxLength={200}
              aria-invalid={erreurs.titreFrancais ? 'true' : undefined}
              aria-describedby={erreurs.titreFrancais ? 'titreFrancais-erreur' : undefined}
              autoFocus
            />
          </Champ>

          <Champ id="titreOriginal" libelle="Titre original" erreur={erreurs.titreOriginal}>
            <input
              id="titreOriginal"
              type="text"
              value={valeurs.titreOriginal}
              onChange={(e) => changer('titreOriginal', e.target.value)}
              placeholder="Titre dans la langue d’origine"
              title="Titre du film dans sa langue d’origine"
              maxLength={200}
              aria-invalid={erreurs.titreOriginal ? 'true' : undefined}
            />
          </Champ>

          <div className="champs-ligne">
            <Champ id="anneeSortie" libelle="Année de sortie" erreur={erreurs.anneeSortie}>
              <input
                id="anneeSortie"
                type="number"
                inputMode="numeric"
                value={valeurs.anneeSortie}
                onChange={(e) => changer('anneeSortie', e.target.value)}
                placeholder="Ex. : 2019"
                title="Année de sortie du film (entre 1888 et 2100)"
                aria-invalid={erreurs.anneeSortie ? 'true' : undefined}
              />
            </Champ>
            <Champ id="dureeMinutes" libelle="Durée (en minutes)" erreur={erreurs.dureeMinutes}>
              <input
                id="dureeMinutes"
                type="number"
                inputMode="numeric"
                value={valeurs.dureeMinutes}
                onChange={(e) => changer('dureeMinutes', e.target.value)}
                placeholder="Ex. : 118"
                title="Durée du film en minutes (de 1 à 9999)"
                aria-invalid={erreurs.dureeMinutes ? 'true' : undefined}
              />
            </Champ>
            <Champ id="nbDisques" libelle="Nombre de disques" erreur={erreurs.nbDisques}>
              <input
                id="nbDisques"
                type="number"
                inputMode="numeric"
                value={valeurs.nbDisques}
                onChange={(e) => changer('nbDisques', e.target.value)}
                placeholder="Ex. : 1"
                title="Nombre de disques du coffret (de 1 à 99)"
                aria-invalid={erreurs.nbDisques ? 'true' : undefined}
              />
            </Champ>
          </div>

          <div className="champs-ligne">
            <Champ id="categorie" libelle="Catégorie" erreur={erreurs.categorie}>
              <select
                id="categorie"
                value={valeurs.categorie}
                onChange={(e) => changer('categorie', e.target.value)}
                title="Choisir la catégorie du film"
                aria-invalid={erreurs.categorie ? 'true' : undefined}
              >
                <option value="">Choisir une catégorie</option>
                {CATEGORIES.map((categorie) => (
                  <option key={categorie} value={categorie}>
                    {categorie}
                  </option>
                ))}
              </select>
            </Champ>
            <Champ id="format" libelle="Format" erreur={erreurs.format}>
              <select
                id="format"
                value={valeurs.format}
                onChange={(e) => changer('format', e.target.value)}
                title="Choisir le format du support"
                aria-invalid={erreurs.format ? 'true' : undefined}
              >
                <option value="">Choisir un format</option>
                {FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </Champ>
          </div>

          <div className="champs-ligne">
            <Champ id="realisateur" libelle="Réalisateur" erreur={erreurs.realisateur} aide="Choisissez un nom proposé ou saisissez-en un nouveau.">
              <input
                id="realisateur"
                type="text"
                list="liste-realisateurs"
                value={valeurs.realisateur}
                onChange={(e) => changer('realisateur', e.target.value)}
                placeholder="Nom du réalisateur"
                title="Nom du réalisateur"
                maxLength={100}
                aria-invalid={erreurs.realisateur ? 'true' : undefined}
              />
              <datalist id="liste-realisateurs">
                {personnes.realisateurs.map((nom) => (
                  <option key={nom} value={nom} />
                ))}
              </datalist>
            </Champ>
            <Champ id="producteur" libelle="Producteur" erreur={erreurs.producteur} aide="Choisissez un nom proposé ou saisissez-en un nouveau.">
              <input
                id="producteur"
                type="text"
                list="liste-producteurs"
                value={valeurs.producteur}
                onChange={(e) => changer('producteur', e.target.value)}
                placeholder="Nom du producteur"
                title="Nom du producteur"
                maxLength={100}
                aria-invalid={erreurs.producteur ? 'true' : undefined}
              />
              <datalist id="liste-producteurs">
                {personnes.producteurs.map((nom) => (
                  <option key={nom} value={nom} />
                ))}
              </datalist>
            </Champ>
          </div>

          <Groupe libelle="Acteurs principaux (trois au maximum)" erreur={erreurs.acteurs}>
            <div className="champs-ligne">
              {valeurs.acteurs.map((acteur, index) => (
                <input
                  key={index}
                  id={`acteur-${index}`}
                  type="text"
                  list="liste-acteurs"
                  value={acteur}
                  onChange={(e) => changerActeur(index, e.target.value)}
                  placeholder={`Acteur ou actrice ${index + 1}`}
                  title={`Nom de l’acteur ou de l’actrice ${index + 1}`}
                  maxLength={100}
                  aria-label={`Acteur ou actrice ${index + 1}`}
                  aria-invalid={erreurs.acteurs && index === 0 ? 'true' : undefined}
                />
              ))}
            </div>
            <datalist id="liste-acteurs">
              {personnes.acteurs.map((nom) => (
                <option key={nom} value={nom} />
              ))}
            </datalist>
          </Groupe>

          <div className="champs-ligne">
            <Groupe libelle="Langues" erreur={erreurs.langues}>
              {LANGUES.map((langue) => (
                <CaseACocher
                  key={langue}
                  id={`langue-${langue}`}
                  libelle={langue}
                  coche={valeurs.langues.includes(langue)}
                  onChange={() => changer('langues', basculer(valeurs.langues, langue))}
                />
              ))}
            </Groupe>
            <Groupe libelle="Sous-titres" erreur={erreurs.sousTitres}>
              {LANGUES.map((langue) => (
                <CaseACocher
                  key={langue}
                  id={`soustitre-${langue}`}
                  libelle={langue}
                  coche={valeurs.sousTitres.includes(langue)}
                  onChange={() => changer('sousTitres', basculer(valeurs.sousTitres, langue))}
                />
              ))}
            </Groupe>
          </div>

          <Groupe
            libelle={`Suppléments disponibles (${valeurs.supplements.length} sur 3)`}
            erreur={erreurs.supplements}
            aide="Vous pouvez choisir jusqu’à trois suppléments."
          >
            <div className="cases-grille">
              {SUPPLEMENTS.map((supplement) => {
                const coche = valeurs.supplements.includes(supplement);
                return (
                  <CaseACocher
                    key={supplement}
                    id={`supplement-${supplement}`}
                    libelle={supplement}
                    coche={coche}
                    desactive={!coche && supplementsAtteints}
                    onChange={() => changer('supplements', basculer(valeurs.supplements, supplement))}
                  />
                );
              })}
            </div>
          </Groupe>

          <Champ id="resume" libelle="Résumé du film" erreur={erreurs.resume}>
            <textarea
              id="resume"
              rows={4}
              value={valeurs.resume}
              onChange={(e) => changer('resume', e.target.value)}
              placeholder="Résumé en quelques lignes"
              title="Résumé du film (2000 caractères au maximum)"
              maxLength={2000}
              aria-invalid={erreurs.resume ? 'true' : undefined}
            />
          </Champ>

          <Groupe libelle="Autres renseignements">
            <CaseACocher
              id="dvdOriginal"
              libelle="DVD original (et non une copie)"
              coche={valeurs.dvdOriginal}
              onChange={(v) => changer('dvdOriginal', v)}
            />
            <CaseACocher
              id="versionEtendue"
              libelle="Version étendue"
              coche={valeurs.versionEtendue}
              onChange={(v) => changer('versionEtendue', v)}
            />
            <CaseACocher
              id="visibleATous"
              libelle="Visible à tous les utilisateurs"
              coche={valeurs.visibleATous}
              onChange={(v) => changer('visibleATous', v)}
              aide="Si cette case est décochée, seuls le propriétaire et le détenteur voient ce DVD."
            />
          </Groupe>
        </div>
      </div>

      <div className="formulaire-actions">
        <button type="submit" className="bouton bouton-primaire" disabled={envoi || televersement}>
          {envoi ? 'Enregistrement…' : libelleBouton}
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={onAnnuler} disabled={envoi}>
          Annuler
        </button>
      </div>
    </form>
  );
}
