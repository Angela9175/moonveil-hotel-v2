const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');

const SECRET = process.env.JWT_SECRET || 'change_this_to_a_long_random_string_in_production';

const generateToken = (userId, email, role) =>
  jwt.sign({ id: userId, email, role }, SECRET, { expiresIn: '7d' });

const formatUser = (u) => ({
  _id: u.id, firstName: u.first_name, lastName: u.last_name,
  email: u.email, role: u.role,
  staffPosition: u.staff_position,
  department: u.department,
  location: u.location,
  employeeId: u.employee_id,
  contactNumber: u.contact_number,
  address: u.address,
  city: u.city,
  createdAt: u.created_at, updatedAt: u.updated_at,
});

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, contactNumber, address, city } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    if (await User.findByEmail(email))
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashed,
      role: 'user',
      contactNumber: contactNumber || null,
      address: address || null,
      city: city || null,
    });
    const token = generateToken(newUser.id, newUser.email, newUser.role);
    res.status(201).json({ message: 'Registered', token, user: formatUser(newUser) });
  } catch (e) {
    res.status(500).json({ message: 'Registration failed', error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email & password required' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user.id, user.email, user.role);
    res.json({ message: 'Login successful', token, user: formatUser(user) });
  } catch (e) {
    res.status(500).json({ message: 'Login failed', error: e.message });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(formatUser(user));
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.json({ message: 'If that email exists, a reset link was sent.' });

    const raw = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await PasswordReset.create({ userId: user.id, tokenHash: hash, expiresAt });

    res.json({
      message: 'Reset link generated. (In production this is emailed.)',
      resetToken: raw,
      expiresAt,
    });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token & password required' });

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const reset = await PasswordReset.findValid(hash);
    if (!reset) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(password, 10);
    await User.update(reset.user_id, { password: hashed });
    await PasswordReset.markUsed(reset.id);
    res.json({ message: 'Password updated successfully' });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

module.exports = { register, login, logout, me, forgotPassword, resetPassword };