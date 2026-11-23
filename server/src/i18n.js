// Server-side translation of API messages.
// The client sends an Accept-Language header ("fr" or "en"). Messages are written in English in the code;
// when the caller asks for French, `message` and `erreurs` in JSON responses are translated here.

const EXACT = {
  'Resource not found.': 'Ressource introuvable.',
  'The data provided is not valid.': 'Les données fournies ne sont pas valides.',
  'Invalid identifier or value.': 'Identifiant ou valeur invalide.',
  'A DVD with this title already exists.': 'Un DVD portant ce titre existe déjà.',
  'This email address is already in use.': 'Cette adresse courriel est déjà utilisée.',
  'This value already exists.': 'Cette valeur existe déjà.',
  'The image must not exceed 2 MB.': 'L’image ne doit pas dépasser 2 Mo.',
  'The request body is not valid JSON.': 'Le corps de la requête n’est pas du JSON valide.',
  'An internal error occurred.': 'Une erreur interne s’est produite.',
  'Database connection error.': 'Erreur de connexion à la base de données.',
  'Authentication required.': 'Authentification requise.',
  'Your session has expired.': 'Votre session a expiré.',
  'Invalid token.': 'Jeton invalide.',
  'User not found.': 'Utilisateur introuvable.',
  'You don’t have the permissions needed for this action.': 'Vous n’avez pas les permissions nécessaires pour cette action.',
  'Invalid identifier.': 'Identifiant invalide.',
  'Several users have this first name. Please use your email address instead.':
    'Plusieurs utilisateurs portent ce prénom. Veuillez utiliser votre adresse courriel.',
  'Incorrect username or password.': 'Nom d’utilisateur ou mot de passe incorrect.',
  'First name, email and password (6 characters minimum) are required.':
    'Le prénom, le courriel et le mot de passe (6 caractères minimum) sont obligatoires.',
  'The administrator’s password can’t be changed.': 'Le mot de passe de l’administrateur ne peut pas être modifié.',
  'The current password is incorrect.': 'Le mot de passe actuel est incorrect.',
  'Your password was changed.': 'Votre mot de passe a été modifié.',
  'The administrator’s data can’t be changed.': 'Les données de l’administrateur ne peuvent pas être modifiées.',
  'No valid recipient.': 'Aucun destinataire valide.',
  'This DVD could not be found.': 'Ce DVD est introuvable.',
  'The selected user could not be found.': 'L’utilisateur sélectionné est introuvable.',
  'This feature does not apply to the administrator.': 'Cette fonction ne s’applique pas à l’administrateur.',
  'Choose a user.': 'Choisissez un utilisateur.',
  'This user could not be found.': 'Cet utilisateur est introuvable.',
  'This DVD is not visible to everyone.': 'Ce DVD n’est pas visible par tous.',
  'Only a superuser can add a DVD for another user.': 'Seul un superutilisateur peut ajouter un DVD pour un autre utilisateur.',
  'You can’t edit this DVD.': 'Vous ne pouvez pas modifier ce DVD.',
  'You can’t delete this DVD.': 'Vous ne pouvez pas supprimer ce DVD.',
  'The DVD was deleted.': 'Le DVD a été supprimé.',
  'Only a superuser can do this on behalf of another user.': 'Seul un superutilisateur peut faire cela au nom d’un autre utilisateur.',
  'This first name or email already exists.': 'Ce prénom ou ce courriel existe déjà.',
  'An administrator can’t be deleted.': 'Un administrateur ne peut pas être supprimé.',
  'The user was deleted.': 'L’utilisateur a été supprimé.',
  'This first name is already used by another user.': 'Ce prénom est déjà utilisé par un autre utilisateur.',
  'This name is reserved.': 'Ce nom est réservé.',
  'Image format not accepted (JPEG, PNG, WebP or GIF).': 'Format d’image refusé (JPEG, PNG, WebP ou GIF).',
  'No image was received.': 'Aucune image n’a été reçue.',
  'A DVD can’t have more than three extras.': 'Un DVD ne peut pas avoir plus de trois suppléments.',
  // validation (schemas.js)
  'Invalid value.': 'Valeur invalide.',
  'Duplicate values.': 'Valeurs en double.',
  'A name must not exceed 100 characters.': 'Un nom ne doit pas dépasser 100 caractères.',
  'The same name can’t be entered twice.': 'Le même nom ne peut pas être saisi deux fois.',
  'The French title is required.': 'Le titre français est obligatoire.',
  'The French title must not exceed 200 characters.': 'Le titre français ne doit pas dépasser 200 caractères.',
  'Invalid category.': 'Catégorie invalide.',
  'Invalid format.': 'Format invalide.',
  'Invalid language.': 'Langue invalide.',
  'Invalid subtitles.': 'Sous-titres invalides.',
  'Invalid extra.': 'Supplément invalide.',
  'Invalid file name.': 'Nom de fichier invalide.',
  'First name or email is required.': 'Le prénom ou le courriel est obligatoire.',
  'The password is required.': 'Le mot de passe est obligatoire.',
  'The password must be at least 6 characters.': 'Le mot de passe doit contenir au moins 6 caractères.',
  'The password must not exceed 100 characters.': 'Le mot de passe ne doit pas dépasser 100 caractères.',
  'The current password is required.': 'Le mot de passe actuel est obligatoire.',
  'Confirmation is required.': 'La confirmation est obligatoire.',
  'The two passwords don’t match.': 'Les deux mots de passe ne correspondent pas.',
  'Invalid color.': 'Couleur invalide.',
  'The number of DVDs per page must be a number.': 'Le nombre de DVD par page doit être un nombre.',
  'The number of DVDs per page must be a whole number.': 'Le nombre de DVD par page doit être un nombre entier.',
  'The minimum is 6 DVDs per page.': 'Le minimum est de 6 DVD par page.',
  'The maximum is 99 DVDs per page.': 'Le maximum est de 99 DVD par page.',
  'Choose a value from the list.': 'Choisissez une valeur dans la liste.',
  'First name is required.': 'Le prénom est obligatoire.',
  'First name must be at least 2 characters.': 'Le prénom doit contenir au moins 2 caractères.',
  'First name must not exceed 60 characters.': 'Le prénom ne doit pas dépasser 60 caractères.',
  'Email is required.': 'Le courriel est obligatoire.',
  'Email must not exceed 120 characters.': 'Le courriel ne doit pas dépasser 120 caractères.',
  'Email is not valid.': 'Le courriel n’est pas valide.',
  'Invalid role.': 'Rôle invalide.',
  'Subject is required.': 'L’objet est obligatoire.',
  'Subject must not exceed 150 characters.': 'L’objet ne doit pas dépasser 150 caractères.',
  'Message is required.': 'Le message est obligatoire.',
  'Message must not exceed 5000 characters.': 'Le message ne doit pas dépasser 5000 caractères.',
  'Choose at least one recipient.': 'Choisissez au moins un destinataire.',
};

const LIBELLES = {
  'The original title': 'Le titre original',
  'The release year': 'L’année de sortie',
  'The summary': 'Le résumé',
  'The duration': 'La durée',
  'The number of discs': 'Le nombre de disques',
  'The director’s name': 'Le nom du réalisateur',
  'The producer’s name': 'Le nom du producteur',
  Actors: 'Acteurs',
};

const lib = (l) => LIBELLES[l] ?? l;

const MOTIFS = [
  [/^(.+) must not exceed (\d+) characters\.$/, (m) => `${lib(m[1])} ne doit pas dépasser ${m[2]} caractères.`],
  [/^(.+) must be a number\.$/, (m) => `${lib(m[1])} doit être un nombre.`],
  [/^(.+) must be a whole number\.$/, (m) => `${lib(m[1])} doit être un nombre entier.`],
  [/^(.+) must be at least (\d+)\.$/, (m) => `${lib(m[1])} doit être d’au moins ${m[2]}.`],
  [/^(.+) must be at most (\d+)\.$/, (m) => `${lib(m[1])} doit être d’au plus ${m[2]}.`],
  [/^You can’t choose more than (\d+) items\.$/, (m) => `Vous ne pouvez pas choisir plus de ${m[1]} éléments.`],
  [/^(.+): (\d+) names maximum\.$/, (m) => `${lib(m[1])} : ${m[2]} noms maximum.`],
  [/^This DVD is already held by (.+)\.$/, (m) => `Ce DVD est déjà détenu par ${m[1]}.`],
  [
    /^Can’t delete (.+): this user owns (\d+) DVD\(s\) and is holding (\d+)\. Transfer or delete those DVDs first\.$/,
    (m) => `Impossible de supprimer ${m[1]} : cet utilisateur possède ${m[2]} DVD et en détient ${m[3]}. Transférez ou supprimez d’abord ces DVD.`,
  ],
];

export function choisirLangue(entete) {
  const premiere = String(entete ?? '').split(',')[0].trim().toLowerCase();
  return premiere.startsWith('fr') ? 'fr' : 'en';
}

export function traduireMessage(message, langue) {
  if (langue !== 'fr' || typeof message !== 'string') {
    return message;
  }
  if (EXACT[message]) {
    return EXACT[message];
  }
  for (const [motif, fabrique] of MOTIFS) {
    const m = message.match(motif);
    if (m) {
      return fabrique(m);
    }
  }
  return message;
}

function traduireCorps(corps, langue) {
  if (langue !== 'fr' || !corps || typeof corps !== 'object' || Array.isArray(corps)) {
    return corps;
  }
  const copie = { ...corps };
  if (typeof copie.message === 'string') {
    copie.message = traduireMessage(copie.message, langue);
  }
  if (copie.erreurs && typeof copie.erreurs === 'object') {
    copie.erreurs = Object.fromEntries(
      Object.entries(copie.erreurs).map(([champ, texte]) => [champ, traduireMessage(texte, langue)])
    );
  }
  return copie;
}

export function middlewareLangue(req, res, next) {
  req.langue = choisirLangue(req.headers['accept-language']);
  if (req.langue === 'fr') {
    const json = res.json.bind(res);
    res.json = (corps) => json(traduireCorps(corps, 'fr'));
  }
  next();
}
