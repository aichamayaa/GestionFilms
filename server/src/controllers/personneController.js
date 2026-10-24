import { listerNoms } from '../services/personnes.js';

export async function lister(req, res) {
  res.json(await listerNoms());
}
