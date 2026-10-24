import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { authentifier, exigerRole } from '../middleware/auth.js';
import { ErreurHttp } from '../middleware/erreurs.js';
import { config } from '../config.js';

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.dossierPochettes),
  filename: (req, file, cb) => {
    const extension = EXTENSIONS[file.mimetype] ?? path.extname(file.originalname).toLowerCase();
    cb(null, `pochette-${Date.now()}-${randomBytes(4).toString('hex')}${extension}`);
  },
});

const televerseur = multer({
  storage: stockage,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!EXTENSIONS[file.mimetype]) {
      return cb(new ErreurHttp(400, 'Format d’image non accepté (JPEG, PNG, WebP ou GIF).'));
    }
    cb(null, true);
  },
});

const router = Router();

router.post('/', authentifier, exigerRole('U', 'S', 'A'), televerseur.single('image'), (req, res) => {
  if (!req.file) {
    throw new ErreurHttp(400, 'Aucune image n’a été reçue.');
  }
  res.status(201).json({ nomFichier: req.file.filename });
});

export default router;
