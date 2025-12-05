import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import userRepository from '../repositories/user.repository.js';

class AuthController {
  async register(req, res) {
    try {
      const { email, password, first_name, last_name, phone, date_of_birth } = req.body;

      // Check if user exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const user = await userRepository.create({
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        date_of_birth
      });

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      // Provide more detailed error messages
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return res.status(400).json({ error: 'User with this email already exists' });
      }
      if (error.message) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
  }

  async login(req, res) {
    try {
      const { email, password, twoFactorCode } = req.body;

      // Find user
      const user = await userRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if 2FA is enabled
      if (user.two_factor_enabled) {
        if (!twoFactorCode) {
          return res.status(200).json({
            requiresTwoFactor: true,
            message: 'Two-factor authentication required'
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.two_factor_secret,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2
        });

        if (!verified) {
          return res.status(401).json({ error: 'Invalid two-factor code' });
        }
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async setupTwoFactor(req, res) {
    try {
      const userId = req.user.id;

      const secret = speakeasy.generateSecret({
        name: `Healthcare Portal (${req.user.email})`,
        issuer: 'Healthcare Portal'
      });

      await userRepository.updateTwoFactorSecret(userId, secret.base32);

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: 'Two-factor authentication setup complete'
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async disableTwoFactor(req, res) {
    try {
      const userId = req.user.id;
      await userRepository.disableTwoFactor(userId);
      res.json({ message: 'Two-factor authentication disabled' });
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AuthController();

