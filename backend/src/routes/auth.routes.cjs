const express = require('express');
const User = require('../models/User.cjs');
const { signToken, comparePassword, hashPassword, authGuard } = require('../utils/auth.cjs');

const router = express.Router();

// Register technician
router.post('/register', async (req, res) => {
  const { name, username, password, phone } = req.body || {};
  if (!name || !username || !password) return res.status(400).json({ message: 'Missing fields' });
  const exists = await User.findOne({ username });
  if (exists) return res.status(409).json({ message: 'Username already in use' });
  const passwordHash = await hashPassword(password);
  const user = await User.create({ name, username, passwordHash, role: 'technician', phone });
  res.json({ message: 'Technician registered', user: { id: user._id, name: user.name } });
});

// Login (admin or tech)
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 1000*60*60*24*30 });
  res.json({ message: 'Logged in', user: { id: user._id, role: user.role, name: user.name } });
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

router.get('/me', authGuard, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, role: u.role, name: u.name, username: u.username });
});

module.exports = router;
