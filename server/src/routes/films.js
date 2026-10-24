import { Router } from 'express';
import { authentifier, exigerRole, verifierIdParam } from '../middleware/auth.js';
import {
  ajouter,
  approprier,
  historique,
  lister,
  modifier,
  obtenir,
  supprimer,
} from '../controllers/filmController.js';

const router = Router();

router.use(authentifier);

router.get('/', lister);
router.post('/', exigerRole('U', 'S'), ajouter);
router.get('/:id', verifierIdParam(), obtenir);
router.put('/:id', verifierIdParam(), modifier);
router.delete('/:id', verifierIdParam(), supprimer);
router.post('/:id/appropriation', verifierIdParam(), exigerRole('U', 'S'), approprier);
router.get('/:id/emprunts', verifierIdParam(), historique);

export default router;
