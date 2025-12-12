import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import { handleValidationErrors } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').trim().notEmpty(),
    body('last_name').trim().notEmpty(),
    handleValidationErrors
  ],
  authController.register.bind(authController)
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    handleValidationErrors
  ],
  authController.login.bind(authController)
);

router.post('/setup-2fa', authenticateToken, authController.setupTwoFactor.bind(authController));
router.post('/disable-2fa', authenticateToken, authController.disableTwoFactor.bind(authController));

export default router;

