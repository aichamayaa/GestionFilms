import { Schema, model } from 'mongoose';

const empruntSchema = new Schema({
  filmId: { type: Schema.Types.ObjectId, ref: 'Film', required: true },
  utilisateurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dateEmprunt: { type: Date, default: Date.now },
});

empruntSchema.index({ filmId: 1, dateEmprunt: -1 });

export default model('Emprunt', empruntSchema);
