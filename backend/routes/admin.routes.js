import express from 'express';
import { body } from 'express-validator';
import adminController from '../controllers/admin.controller.js';
import { adminAuth } from '../middlewares/adminAuth.middleware.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(adminAuth);

// Dashboard Statistics
router.get('/dashboard/stats', adminController.getDashboardStats.bind(adminController));

// User Management
router.get('/users', adminController.getAllUsers.bind(adminController));
router.get('/users/:id', adminController.getUserById.bind(adminController));
router.post('/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    body('role').optional().isIn(['patient', 'admin', 'provider']),
    handleValidationErrors
  ],
  adminController.createUser.bind(adminController)
);
router.put('/users/:id',
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['patient', 'admin', 'provider']),
    handleValidationErrors
  ],
  adminController.updateUser.bind(adminController)
);
router.delete('/users/:id', adminController.deleteUser.bind(adminController));

// Appointment Management
router.get('/appointments', adminController.getAllAppointments.bind(adminController));
router.put('/appointments/:id',
  [
    body('status').optional().isIn(['scheduled', 'completed', 'cancelled', 'no-show']),
    handleValidationErrors
  ],
  adminController.updateAppointmentStatus.bind(adminController)
);

// Provider Management
router.get('/providers', adminController.getAllProviders.bind(adminController));
router.post('/providers',
  [
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    body('specialty').trim().notEmpty(),
    handleValidationErrors
  ],
  adminController.createProvider.bind(adminController)
);
router.delete('/providers/:id', adminController.deleteProvider.bind(adminController));
// Provider availability
router.get('/providers/:id/availability', adminController.getProviderAvailability.bind(adminController));
router.post('/providers/:id/availability', adminController.createProviderAvailability.bind(adminController));
router.put('/providers/:id/availability/:availabilityId', adminController.updateProviderAvailability.bind(adminController));
router.delete('/providers/:id/availability/:availabilityId', adminController.deleteProviderAvailability.bind(adminController));

// Facility Management
router.get('/facilities', adminController.getAllFacilities.bind(adminController));
router.post('/facilities',
  [
    body('name').trim().notEmpty(),
    body('address').trim().notEmpty(),
    handleValidationErrors
  ],
  adminController.createFacility.bind(adminController)
);
router.delete('/facilities/:id', adminController.deleteFacility.bind(adminController));

// Event Management
router.get('/events', adminController.getAllEvents.bind(adminController));
router.post('/events',
  [
    body('title').trim().notEmpty(),
    body('event_date').isISO8601(),
    body('event_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
    body('event_type').isIn(['class', 'screening', 'webinar']),
    handleValidationErrors
  ],
  adminController.createEvent.bind(adminController)
);
router.put('/events/:id', adminController.updateEvent.bind(adminController));
router.delete('/events/:id', adminController.deleteEvent.bind(adminController));
router.get('/events/:id/registrations', adminController.getEventRegistrations.bind(adminController));
router.put('/events/:eventId/registrations/:userId', adminController.updateEventRegistrationStatus.bind(adminController));

export default router;

