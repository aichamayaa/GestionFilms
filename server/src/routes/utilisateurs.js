import { Router } from 'express';
import { authentifier, exigerRole, verifierIdParam } from '../middleware/auth.js';
import {
  annuaire,
  creer,
  lister,
  modifier,
  obtenir,
  supprimer,
} from '../controllers/utilisateurController.js';

const router = Router();

router.use(authentifier);

router.get('/annuaire', annuaire);

router.use(exigerRole('A'));

router.get('/', lister);
router.post('/', creer);
router.get('/:id', verifierIdParam(), obtenir);
router.put('/:id', verifierIdParam(), modifier);
router.delete('/:id', verifierIdParam(), supprimer);

export default router;
