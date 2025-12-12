import jwt from 'jsonwebtoken';

export const adminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is admin
    if (user.role === 'admin') {
      req.user = user;
      next(); // User is an admin, proceed
    } else {
      res.status(403).json({ 
        error: 'Access denied. Administrator privileges required.' 
      });
    }
  });
};

export const requireAdmin = adminAuth;

