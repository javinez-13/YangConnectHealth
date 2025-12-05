import express from 'express';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import userRepository from '../repositories/user.repository.js';

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow role changes through this endpoint
    delete updates.role;
    delete updates.password;
    
    const user = await userRepository.update(req.user.id, updates);
    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

