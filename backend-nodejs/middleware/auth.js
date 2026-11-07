const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'moonveil_super_secret_key_2026';

const protect = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // Handle mock tokens if used in your setup
  if (token.startsWith('mock-admin-') || token.startsWith('mock-staff-')) {
    req.user = token.startsWith('mock-admin-')
      ? { id: 1, role: 'admin' }
      : { id: 3, role: 'staff', firstName: 'David' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const admin = (req, res, next) => {
  protect(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    next();
  });
};

const staff = (req, res, next) => {
  protect(req, res, () => {
    if (req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Staff only' });
    }
    next();
  });
};

// Dual-role middleware allowing both Admin and Front Desk Staff
const adminOrStaff = (req, res, next) => {
  protect(req, res, () => {
    const role = String(req.user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'staff') {
      return res.status(403).json({ message: 'Admin or Staff only' });
    }
    next();
  });
};

module.exports = { protect, admin, staff, adminOrStaff };