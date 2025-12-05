import express from 'express';
import eventController from '../controllers/event.controller.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', optionalAuth, eventController.getAll.bind(eventController));
router.get('/my-registrations', authenticateToken, eventController.getUserRegistrations.bind(eventController));
router.post('/:id/register', authenticateToken, eventController.register.bind(eventController));
router.get('/:id', optionalAuth, eventController.getById.bind(eventController));

export default router;

