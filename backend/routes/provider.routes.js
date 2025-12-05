import express from 'express';
import providerController from '../controllers/provider.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, providerController.getAll.bind(providerController));
router.get('/specialty/:specialty', optionalAuth, providerController.getBySpecialty.bind(providerController));
router.get('/:id', optionalAuth, providerController.getById.bind(providerController));

export default router;

