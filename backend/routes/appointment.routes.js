import express from 'express';
import { body } from 'express-validator';
import appointmentController from '../controllers/appointment.controller.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post('/',
  authenticateToken,
  [
    body('provider_id').isInt(),
    body('facility_id').isInt(),
    body('appointment_date').isISO8601(),
    body('appointment_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('reason').trim().notEmpty(),
    handleValidationErrors
  ],
  appointmentController.create.bind(appointmentController)
);

router.get('/', authenticateToken, appointmentController.getAll.bind(appointmentController));
router.get('/slots', optionalAuth, appointmentController.getAvailableSlots.bind(appointmentController));
router.get('/:id', authenticateToken, appointmentController.getById.bind(appointmentController));
router.put('/:id', authenticateToken, appointmentController.update.bind(appointmentController));
router.delete('/:id', authenticateToken, appointmentController.cancel.bind(appointmentController));

export default router;

