import { Schema, model } from 'mongoose';

const realisateurSchema = new Schema({
  nom: { type: String, required: true, trim: true },
});

export default model('Realisateur', realisateurSchema);
