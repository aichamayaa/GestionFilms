import Film from '../models/Film.js';
import User from '../models/User.js';
import Emprunt from '../models/Emprunt.js';
import { ErreurHttp } from '../middleware/erreurs.js';
import { ajoutFilmSchema, appropriationSchema, filmSchema, valider } from '../validation/schemas.js';
import {
  COLLATION_FR,
  POPULATION_DETAIL,
  calculerPermissions,
  filtreRecherche,
  filtreVisibilite,
  formaterDetail,
  formaterVignette,
  ordreDeTri,
  peutVoir,
  titreExiste,
} from '../services/films.js';
import { resoudreActeurs, resoudreProducteur, resoudreRealisateur } from '../services/personnes.js';
import { aviser } from '../services/courriel.js';
import { COURRIEL_ADMIN } from '../constantes.js';
import { courrielAjout, courrielAppropriation, courrielSuppression } from '../services/gabarits.js';

const PORTEES = ['tous', 'en-main', 'utilisateur'];
const TRIS = ['titre', 'utilisateur', 'utilisateur-titre'];
const CHAMPS_SIMPLES = [
  'titreFrancais',
  'titreOriginal',
  'anneeSortie',
  'categorie',
  'format',
  'langues',
  'sousTitres',
  'supplements',
  'resume',
  'dureeMinutes',
  'dvdOriginal',
  'versionEtendue',
  'visibleATous',
  'nbDisques',
  'imagePochette',
];

async function chargerFilm(id) {
  const film = await Film.findById(id);
  if (!film) {
    throw new ErreurHttp(404, 'This DVD could not be found.');
  }
  return film;
}

async function chargerUtilisateurCible(id) {
  const cible = await User.findById(id);
  if (!cible || cible.courriel === COURRIEL_ADMIN) {
    throw new ErreurHttp(400, 'The selected user could not be found.', { pourUtilisateurId: 'User not found.' });
  }
  return cible;
}

async function verifierTitre(titre, idExclu) {
  if (await titreExiste(titre, idExclu)) {
    throw new ErreurHttp(409, 'A DVD with this title already exists.', {
      titreFrancais: 'A DVD with this title already exists.',
    });
  }
}

async function appliquerDonnees(film, donnees) {
  for (const champ of CHAMPS_SIMPLES) {
    film.set(champ, donnees[champ]);
  }
  film.set('acteurs', await resoudreActeurs(donnees.acteurs));
  film.set('realisateurId', await resoudreRealisateur(donnees.realisateur));
  film.set('producteurId', await resoudreProducteur(donnees.producteur));
}

export async function lister(req, res) {
  const portee = PORTEES.includes(req.query.portee) ? req.query.portee : 'tous';
  const tri = TRIS.includes(req.query.tri) ? req.query.tri : 'titre';
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const demande = Number.parseInt(req.query.page, 10);

  const conditions = [];
  const visibilite = filtreVisibilite(req.user);
  if (Object.keys(visibilite).length > 0) {
    conditions.push(visibilite);
  }

  if (portee === 'en-main') {
    if (req.user.role === 'A') {
      throw new ErreurHttp(403, 'This feature does not apply to the administrator.');
    }
    conditions.push({ detenteurId: req.user._id });
  }

  let utilisateurChoisi = null;
  if (portee === 'utilisateur') {
    if (!/^[0-9a-fA-F]{24}$/.test(String(req.query.utilisateurId ?? ''))) {
      throw new ErreurHttp(400, 'Choose a user.');
    }
    utilisateurChoisi = await User.findById(req.query.utilisateurId).select('nom courriel');
    if (!utilisateurChoisi || utilisateurChoisi.courriel === COURRIEL_ADMIN) {
      throw new ErreurHttp(404, 'This user could not be found.');
    }
    conditions.push({ detenteurId: utilisateurChoisi._id });
  }

  if (portee === 'tous' && q) {
    conditions.push(filtreRecherche(q));
  }

  const filtre = conditions.length > 0 ? { $and: conditions } : {};
  const parPage = req.user.preferences?.nbFilmsParPage || 12;
  const total = await Film.countDocuments(filtre);
  const nbPages = Math.max(1, Math.ceil(total / parPage));
  const page = Math.min(Math.max(Number.isNaN(demande) ? 1 : demande, 1), nbPages);

  const films = await Film.find(filtre)
    .select('titreFrancais imagePochette detenteurId detenteurNom proprietaireId visibleATous')
    .sort(portee === 'tous' ? ordreDeTri(tri) : { titreFrancais: 1 })
    .collation(COLLATION_FR)
    .skip((page - 1) * parPage)
    .limit(parPage)
    .lean();

  res.json({
    films: films.map((film) => formaterVignette(film, req.user)),
    page,
    nbPages,
    total,
    parPage,
    utilisateur: utilisateurChoisi ? { _id: String(utilisateurChoisi._id), nom: utilisateurChoisi.nom } : null,
  });
}

export async function obtenir(req, res) {
  const film = await chargerFilm(req.params.id);
  if (!peutVoir(req.user, film)) {
    throw new ErreurHttp(403, 'This DVD is not visible to everyone.');
  }
  await film.populate(POPULATION_DETAIL);
  res.json({ film: formaterDetail(film, req.user) });
}

export async function ajouter(req, res) {
  const donnees = valider(ajoutFilmSchema, req.body);
  let cible = req.user;

  if (donnees.pourUtilisateurId && donnees.pourUtilisateurId !== String(req.user._id)) {
    if (req.user.role !== 'S') {
      throw new ErreurHttp(403, 'Only a superuser can add a DVD for another user.');
    }
    cible = await chargerUtilisateurCible(donnees.pourUtilisateurId);
  }

  await verifierTitre(donnees.titreFrancais);

  const film = new Film();
  await appliquerDonnees(film, donnees);
  film.proprietaireId = cible._id;
  film.detenteurId = cible._id;
  film.detenteurNom = cible.nom;
  film.utilisateurMAJ = req.user._id;
  film.dateMAJ = new Date();
  await film.save();

  await film.populate(POPULATION_DETAIL);

  const gabaritAjout = courrielAjout({
    auteur: req.user.nom,
    film,
    cible: cible.nom,
    pourAutrui: !cible._id.equals(req.user._id),
  });
  await aviser('courrielSiAjout', gabaritAjout.sujet, gabaritAjout.corps);

  res.status(201).json({ film: formaterDetail(film, req.user) });
}

export async function modifier(req, res) {
  const film = await chargerFilm(req.params.id);

  if (!calculerPermissions(req.user, film).modifier) {
    throw new ErreurHttp(403, 'You can’t edit this DVD.');
  }

  const donnees = valider(filmSchema, req.body);
  await verifierTitre(donnees.titreFrancais, film._id);

  await appliquerDonnees(film, donnees);
  film.utilisateurMAJ = req.user._id;
  film.dateMAJ = new Date();
  await film.save();

  await film.populate(POPULATION_DETAIL);
  res.json({ film: formaterDetail(film, req.user) });
}

export async function supprimer(req, res) {
  const film = await chargerFilm(req.params.id);

  if (!calculerPermissions(req.user, film).supprimer) {
    throw new ErreurHttp(403, 'You can’t delete this DVD.');
  }

  await Film.deleteOne({ _id: film._id });
  await Emprunt.deleteMany({ filmId: film._id });

  const gabaritSuppression = courrielSuppression({ auteur: req.user.nom, film });
  await aviser('courrielSiSuppression', gabaritSuppression.sujet, gabaritSuppression.corps);

  res.json({ message: 'The DVD was deleted.' });
}

export async function approprier(req, res) {
  const { nouveauDetenteurId } = valider(appropriationSchema, req.body);
  const film = await chargerFilm(req.params.id);

  if (!peutVoir(req.user, film)) {
    throw new ErreurHttp(403, 'This DVD is not visible to everyone.');
  }

  let nouveau = req.user;
  if (nouveauDetenteurId && nouveauDetenteurId !== String(req.user._id)) {
    if (req.user.role !== 'S') {
      throw new ErreurHttp(403, 'Only a superuser can do this on behalf of another user.');
    }
    nouveau = await chargerUtilisateurCible(nouveauDetenteurId);
  }

  if (film.detenteurId && film.detenteurId.equals(nouveau._id)) {
    throw new ErreurHttp(400, `This DVD is already held by ${nouveau.nom}.`);
  }

  const ancienNom = film.detenteurNom || '';

  film.detenteurId = nouveau._id;
  film.detenteurNom = nouveau.nom;
  film.utilisateurMAJ = req.user._id;
  film.dateMAJ = new Date();
  await film.save();

  await Emprunt.create({ filmId: film._id, utilisateurId: nouveau._id });

  const gabaritAppropriation = courrielAppropriation({
    auteur: req.user.nom,
    film,
    nouveau: nouveau.nom,
    parAutrui: !nouveau._id.equals(req.user._id),
    ancienNom,
  });
  await aviser('courrielSiAppropriation', gabaritAppropriation.sujet, gabaritAppropriation.corps);

  await film.populate(POPULATION_DETAIL);
  res.json({ film: formaterDetail(film, req.user) });
}

export async function historique(req, res) {
  const film = await chargerFilm(req.params.id);
  if (!peutVoir(req.user, film)) {
    throw new ErreurHttp(403, 'This DVD is not visible to everyone.');
  }

  const emprunts = await Emprunt.find({ filmId: film._id })
    .sort({ dateEmprunt: -1 })
    .populate('utilisateurId', 'nom')
    .lean();

  res.json({
    emprunts: emprunts.map((e) => ({
      _id: String(e._id),
      utilisateur: e.utilisateurId ? { _id: String(e.utilisateurId._id), nom: e.utilisateurId.nom } : null,
      dateEmprunt: e.dateEmprunt,
    })),
  });
}
