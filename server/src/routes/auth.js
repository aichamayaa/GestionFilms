import { Router } from 'express';
import { authentifier } from '../middleware/auth.js';
import { changerMotDePasse, connexion, inscription, modifierPreferences, moi } from '../controllers/authController.js';

const router = Router();

router.post('/connexion', connexion);
router.post('/inscription', inscription);
router.get('/moi', authentifier, moi);
router.put('/mot-de-passe', authentifier, changerMotDePasse);
router.put('/preferences', authentifier, modifierPreferences);

export default router;