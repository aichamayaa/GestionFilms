import { Schema, model } from 'mongoose';
import { ROLES } from '../constantes.js';

const userSchema = new Schema(
  {
    nom: { type: String, required: true, trim: true },
    courriel: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasseHache: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'U' },
    preferences: {
      nbFilmsParPage: { type: Number, default: 12, min: 6, max: 99 },
      courrielSiAjout: { type: Boolean, default: true },
      courrielSiAppropriation: { type: Boolean, default: true },
      courrielSiSuppression: { type: Boolean, default: true },
      couleurFond: String,
      couleurTexte: String,
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.motDePasseHache;
    delete ret.__v;
    return ret;
  },
});

export default model('User', userSchema);
