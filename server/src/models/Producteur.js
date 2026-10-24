import { Schema, model } from 'mongoose';

const producteurSchema = new Schema({
  nom: { type: String, required: true, trim: true },
});

export default model('Producteur', producteurSchema);
