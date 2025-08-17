const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User.cjs');

module.exports.function signToken(user) {
  const payload = { id: user._id, role: user.role, name: user.name };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
}

module.exports.async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

module.exports.async function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

module.exports.async function authGuard(req, res, next) {
  try {
    const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id);
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports.function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
