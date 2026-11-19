import { useEffect, useRef, useState } from 'react';
import { api, ErreurApi } from '../api/client.js';
import { CATEGORIES, FORMATS, LANGUES, SUPPLEMENTS, traduire, trierParLibelle } from '../constantes.js';
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
      setErreurs((e) => ({ ...e, imagePochette: 'Choose a JPEG, PNG, WebP or GIF image.' }));
      return;
    }
    if (fichier.size > 2 * 1024 * 1024) {
      setErreurs((e) => ({ ...e, imagePochette: 'The image must not exceed 2 MB.' }));
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
      setErreurGenerale('The form contains errors. Fix the fields in red.');
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
        setErreurGenerale('An unexpected error occurred.');
      }
      setEnvoi(false);
    }
  }

  const supplementsAtteints = valeurs.supplements.length >= 3;
  const urlImage = urlPochette(valeurs.imagePochette);

  return (
    <form ref={formulaire} className="panneau formulaire-dvd" onSubmit={soumettre} noValidate>
      <h1 className="formulaire-titre">{titre}</h1>
      <p className="aide">Fields marked with an asterisk (*) are required. Only the French title is required.</p>

      {informationPourQui && <Alerte type="info">{informationPourQui}</Alerte>}
      <Alerte type="erreur">{erreurGenerale}</Alerte>

      {utilisateursCibles && (
        <Champ id="pourUtilisateurId" libelle="Add this DVD for" erreur={erreurs.pourUtilisateurId} aide="As a superuser, you choose who you are doing this for.">
          <select
            id="pourUtilisateurId"
            value={valeurs.pourUtilisateurId}
            onChange={(e) => changer('pourUtilisateurId', e.target.value)}
            title="User who will own and hold the DVD"
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
              <img src={urlImage} alt="Cover preview" />
            ) : (
              <span>No cover</span>
            )}
          </div>
          <Champ id="imagePochette" libelle="Cover image" erreur={erreurs.imagePochette} aide="JPEG, PNG, WebP or GIF, 2 MB maximum.">
            <input
              id="imagePochette"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={choisirImage}
              disabled={televersement}
              aria-invalid={erreurs.imagePochette ? 'true' : undefined}
              title="Choose an image for the DVD cover"
            />
          </Champ>
          {televersement && <p className="aide">Uploading…</p>}
          {valeurs.imagePochette && (
            <button type="button" className="bouton bouton-petit bouton-secondaire" onClick={() => changer('imagePochette', '')}>
              Remove image
            </button>
          )}
        </div>

        <div className="formulaire-champs">
          <Champ id="titreFrancais" libelle="French title" requis erreur={erreurs.titreFrancais}>
            <input
              id="titreFrancais"
              type="text"
              value={valeurs.titreFrancais}
              onChange={(e) => changer('titreFrancais', e.target.value)}
              placeholder="e.g. Le Sillage du Nord"
              title="Title shown in the list. Two DVDs can’t have the same title."
              maxLength={200}
              aria-invalid={erreurs.titreFrancais ? 'true' : undefined}
              aria-describedby={erreurs.titreFrancais ? 'titreFrancais-erreur' : undefined}
              autoFocus
            />
          </Champ>

          <Champ id="titreOriginal" libelle="Original title" erreur={erreurs.titreOriginal}>
            <input
              id="titreOriginal"
              type="text"
              value={valeurs.titreOriginal}
              onChange={(e) => changer('titreOriginal', e.target.value)}
              placeholder="Title in the original language"
              title="Film title in its original language"
              maxLength={200}
              aria-invalid={erreurs.titreOriginal ? 'true' : undefined}
            />
          </Champ>

          <div className="champs-ligne">
            <Champ id="anneeSortie" libelle="Release year" erreur={erreurs.anneeSortie}>
              <input
                id="anneeSortie"
                type="number"
                inputMode="numeric"
                value={valeurs.anneeSortie}
                onChange={(e) => changer('anneeSortie', e.target.value)}
                placeholder="e.g. 2019"
                title="Film release year (between 1888 and 2100)"
                aria-invalid={erreurs.anneeSortie ? 'true' : undefined}
              />
            </Champ>
            <Champ id="dureeMinutes" libelle="Duration (in minutes)" erreur={erreurs.dureeMinutes}>
              <input
                id="dureeMinutes"
                type="number"
                inputMode="numeric"
                value={valeurs.dureeMinutes}
                onChange={(e) => changer('dureeMinutes', e.target.value)}
                placeholder="e.g. 118"
                title="Film duration in minutes (1 to 9999)"
                aria-invalid={erreurs.dureeMinutes ? 'true' : undefined}
              />
            </Champ>
            <Champ id="nbDisques" libelle="Number of discs" erreur={erreurs.nbDisques}>
              <input
                id="nbDisques"
                type="number"
                inputMode="numeric"
                value={valeurs.nbDisques}
                onChange={(e) => changer('nbDisques', e.target.value)}
                placeholder="e.g. 1"
                title="Number of discs in the set (1 to 99)"
                aria-invalid={erreurs.nbDisques ? 'true' : undefined}
              />
            </Champ>
          </div>

          <div className="champs-ligne">
            <Champ id="categorie" libelle="Category" erreur={erreurs.categorie}>
              <select
                id="categorie"
                value={valeurs.categorie}
                onChange={(e) => changer('categorie', e.target.value)}
                title="Choose the film category"
                aria-invalid={erreurs.categorie ? 'true' : undefined}
              >
                <option value="">Choose a category</option>
                {trierParLibelle(CATEGORIES).map((categorie) => (
                  <option key={categorie} value={categorie}>{traduire(categorie)}</option>
                ))}
              </select>
            </Champ>
            <Champ id="format" libelle="Format" erreur={erreurs.format}>
              <select
                id="format"
                value={valeurs.format}
                onChange={(e) => changer('format', e.target.value)}
                title="Choose the disc format"
                aria-invalid={erreurs.format ? 'true' : undefined}
              >
                <option value="">Choose a format</option>
                {FORMATS.map((format) => (
                  <option key={format} value={format}>{traduire(format)}</option>
                ))}
              </select>
            </Champ>
          </div>

          <div className="champs-ligne">
            <Champ id="realisateur" libelle="Director" erreur={erreurs.realisateur} aide="Choose a suggested name or type a new one.">
              <input
                id="realisateur"
                type="text"
                list="liste-realisateurs"
                value={valeurs.realisateur}
                onChange={(e) => changer('realisateur', e.target.value)}
                placeholder="Director’s name"
                title="Director’s name"
                maxLength={100}
                aria-invalid={erreurs.realisateur ? 'true' : undefined}
              />
              <datalist id="liste-realisateurs">
                {personnes.realisateurs.map((nom) => (
                  <option key={nom} value={nom} />
                ))}
              </datalist>
            </Champ>
            <Champ id="producteur" libelle="Producer" erreur={erreurs.producteur} aide="Choose a suggested name or type a new one.">
              <input
                id="producteur"
                type="text"
                list="liste-producteurs"
                value={valeurs.producteur}
                onChange={(e) => changer('producteur', e.target.value)}
                placeholder="Producer’s name"
                title="Producer’s name"
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

          <Groupe libelle="Main actors (three maximum)" erreur={erreurs.acteurs}>
            <div className="champs-ligne">
              {valeurs.acteurs.map((acteur, index) => (
                <input
                  key={index}
                  id={`acteur-${index}`}
                  type="text"
                  list="liste-acteurs"
                  value={acteur}
                  onChange={(e) => changerActeur(index, e.target.value)}
                  placeholder={`Actor ${index + 1}`}
                  title={`Name of actor ${index + 1}`}
                  maxLength={100}
                  aria-label={`Actor ${index + 1}`}
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
            <Groupe libelle="Languages" erreur={erreurs.langues}>
              {LANGUES.map((langue) => (
                <CaseACocher
                  key={langue}
                  id={`langue-${langue}`}
                  libelle={traduire(langue)}
                  coche={valeurs.langues.includes(langue)}
                  onChange={() => changer('langues', basculer(valeurs.langues, langue))}
                />
              ))}
            </Groupe>
            <Groupe libelle="Subtitles" erreur={erreurs.sousTitres}>
              {LANGUES.map((langue) => (
                <CaseACocher
                  key={langue}
                  id={`soustitre-${langue}`}
                  libelle={traduire(langue)}
                  coche={valeurs.sousTitres.includes(langue)}
                  onChange={() => changer('sousTitres', basculer(valeurs.sousTitres, langue))}
                />
              ))}
            </Groupe>
          </div>

          <Groupe
            libelle={`Available extras (${valeurs.supplements.length} of 3)`}
            erreur={erreurs.supplements}
            aide="You can choose up to three extras."
          >
            <div className="cases-grille">
              {trierParLibelle(SUPPLEMENTS).map((supplement) => {
                const coche = valeurs.supplements.includes(supplement);
                return (
                  <CaseACocher
                    key={supplement}
                    id={`supplement-${supplement}`}
                    libelle={traduire(supplement)}
                    coche={coche}
                    desactive={!coche && supplementsAtteints}
                    onChange={() => changer('supplements', basculer(valeurs.supplements, supplement))}
                  />
                );
              })}
            </div>
          </Groupe>

          <Champ id="resume" libelle="Film summary" erreur={erreurs.resume}>
            <textarea
              id="resume"
              rows={4}
              value={valeurs.resume}
              onChange={(e) => changer('resume', e.target.value)}
              placeholder="Summary in a few lines"
              title="Film summary (2000 characters maximum)"
              maxLength={2000}
              aria-invalid={erreurs.resume ? 'true' : undefined}
            />
          </Champ>

          <Groupe libelle="Other information">
            <CaseACocher
              id="dvdOriginal"
              libelle="Original DVD (not a copy)"
              coche={valeurs.dvdOriginal}
              onChange={(v) => changer('dvdOriginal', v)}
            />
            <CaseACocher
              id="versionEtendue"
              libelle="Extended edition"
              coche={valeurs.versionEtendue}
              onChange={(v) => changer('versionEtendue', v)}
            />
            <CaseACocher
              id="visibleATous"
              libelle="Visible to all users"
              coche={valeurs.visibleATous}
              onChange={(v) => changer('visibleATous', v)}
              aide="If unchecked, only the owner and the holder can see this DVD."
            />
          </Groupe>
        </div>
      </div>

      <div className="formulaire-actions">
        <button type="submit" className="bouton bouton-primaire" disabled={envoi || televersement}>
          {envoi ? 'Saving…' : libelleBouton}
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={onAnnuler} disabled={envoi}>
          Cancel
        </button>
      </div>
    </form>
  );
}
