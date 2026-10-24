import { Router } from 'express';
import { authentifier } from '../middleware/auth.js';
import { boite, envoyer } from '../controllers/courrielController.js';

const router = Router();

router.use(authentifier);

router.post('/', envoyer);
router.get('/boite', boite);

export default router;
