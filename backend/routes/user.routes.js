import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { authenticateToken } from '../middlewares/auth.middleware.js';
import userRepository from '../repositories/user.repository.js';

// Create uploads directory if it doesn't exist
const uploadsDir = './uploads/profile-pictures';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'), false);
    } else {
      cb(null, true);
    }
  }
});

const router = express.Router();

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow role changes through this endpoint
    delete updates.role;
    delete updates.password;
    
    // If a file was uploaded, store the file path
    if (req.file) {
      updates.profile_picture_url = `/uploads/profile-pictures/${req.file.filename}`;
    }
    
    const user = await userRepository.update(req.user.id, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Failed to update profile'
    });
  }
});

export default router;

