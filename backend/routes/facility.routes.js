import express from 'express';
import facilityController from '../controllers/facility.controller.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, facilityController.getAll.bind(facilityController));
router.get('/patient', authenticateToken, facilityController.getByPatient.bind(facilityController));
router.get('/:id', optionalAuth, facilityController.getById.bind(facilityController));

export default router;

