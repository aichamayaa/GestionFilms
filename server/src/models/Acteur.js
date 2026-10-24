import { Schema, model } from 'mongoose';

const acteurSchema = new Schema({
  nom: { type: String, required: true, trim: true },
  sexe: { type: String, enum: ['F', 'H', 'N'], default: 'N' },
});

export default model('Acteur', acteurSchema);
