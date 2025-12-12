import express from 'express';
import providerController from '../controllers/provider.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, providerController.getAll.bind(providerController));
// These routes must come before /:id to avoid matching conflicts
router.get('/specialty/:specialty', optionalAuth, providerController.getBySpecialty.bind(providerController));
router.get('/:providerId/availability', optionalAuth, providerController.getAvailability.bind(providerController));
router.get('/:id', optionalAuth, providerController.getById.bind(providerController));

export default router;
