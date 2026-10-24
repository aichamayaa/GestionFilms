import { Router } from 'express';
import { authentifier } from '../middleware/auth.js';
import { lister } from '../controllers/personneController.js';

const router = Router();

router.get('/', authentifier, lister);

export default router;
