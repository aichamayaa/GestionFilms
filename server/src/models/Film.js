import { Schema, model } from 'mongoose';
import { CATEGORIES, FORMATS, LANGUES, SUPPLEMENTS } from '../constantes.js';

const filmSchema = new Schema(
  {
    titreFrancais: { type: String, required: true, unique: true, trim: true },
    titreOriginal: { type: String, trim: true },
    anneeSortie: Number,
    categorie: { type: String, enum: CATEGORIES },
    format: { type: String, enum: FORMATS },
    langues: [{ type: String, enum: LANGUES }],
    sousTitres: [{ type: String, enum: LANGUES }],
    supplements: {
      type: [{ type: String, enum: SUPPLEMENTS }],
      validate: {
        validator: (valeurs) => valeurs.length <= 3,
        message: 'Un DVD ne peut avoir plus de trois suppléments.',
      },
    },
    resume: String,
    dureeMinutes: { type: Number, min: 1, max: 9999 },
    dvdOriginal: Boolean,
    versionEtendue: Boolean,
    visibleATous: { type: Boolean, default: true },
    nbDisques: { type: Number, min: 1, max: 99 },
    imagePochette: String,

    acteurs: [{ type: Schema.Types.ObjectId, ref: 'Acteur' }],
    realisateurId: { type: Schema.Types.ObjectId, ref: 'Realisateur' },
    producteurId: { type: Schema.Types.ObjectId, ref: 'Producteur' },

    proprietaireId: { type: Schema.Types.ObjectId, ref: 'User' },
    detenteurId: { type: Schema.Types.ObjectId, ref: 'User' },
    detenteurNom: String,
    utilisateurMAJ: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: false, updatedAt: 'dateMAJ' } }
);

filmSchema.index({ categorie: 1 });
filmSchema.index({ realisateurId: 1 });
filmSchema.index({ producteurId: 1 });
filmSchema.index({ detenteurId: 1 });
filmSchema.index({ detenteurNom: 1 });

export default model('Film', filmSchema);
