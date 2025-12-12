import express from 'express';
import { body } from 'express-validator';
import vitalsController from '../controllers/vitals.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post('/',
  authenticateToken,
  [
    body('heart_rate').optional().isInt({ min: 0, max: 300 }),
    body('temperature').optional().isFloat({ min: 90, max: 110 }),
    body('weight').optional().isFloat({ min: 0 }),
    body('height').optional().isFloat({ min: 0 }),
    handleValidationErrors
  ],
  vitalsController.create.bind(vitalsController)
);

router.get('/', authenticateToken, vitalsController.getAll.bind(vitalsController));
router.get('/latest', authenticateToken, vitalsController.getLatest.bind(vitalsController));

export default router;

