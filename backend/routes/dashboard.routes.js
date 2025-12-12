import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, dashboardController.getDashboard.bind(dashboardController));

export default router;

