const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const User = require('../models/User');

const generateEmployeeId = async () => {
  const prefix = 'MOON';
  const [rows] = await pool.query(
    "SELECT employee_id FROM users WHERE role = 'staff' AND employee_id IS NOT NULL"
  );

  const matches = rows
    .map((row) => row.employee_id)
    .filter((value) => value && value.startsWith(`${prefix}-`))
    .map((value) => {
      const match = value.match(/(\d+)$/);
      return match ? Number(match[1]) : 0;
    });

  const nextNumber = matches.length ? Math.max(...matches) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
};

const normalizeValue = (value) => (value === '' || value === undefined ? null : value);
const isGuestAccountRole = (role) => ['user', 'guest'].includes(String(role || '').toLowerCase());

const buildGuestAutoProfile = ({ firstName, lastName, contactNumber = '', address = '', city = '' } = {}, options = {}) => {
  const safeFirstName = String(firstName || 'Guest').trim() || 'Guest';
  const safeLastName = String(lastName || 'Guest').trim() || 'Guest';
  const seed = options.seed ?? Date.now();
  const email = `${safeFirstName.toLowerCase()}.${safeLastName.toLowerCase()}.${seed}@guest.local`;
  return {
    firstName: safeFirstName,
    lastName: safeLastName,
    email,
    password: 'Guest@123',
    contactNumber: contactNumber || '',
    address: address || '',
    city: city || '',
  };
};

const formatUser = (u) => ({
  _id: u.id, id: u.id,
  firstName: u.first_name || u.firstName, 
  lastName: u.last_name || u.lastName,
  email: u.email, role: u.role,
  staffPosition: normalizeValue(u.staff_position),
  department: normalizeValue(u.department),
  location: normalizeValue(u.location),
  employeeId: normalizeValue(u.employee_id),
  contactNumber: normalizeValue(u.contact_number || u.contactNumber),
  address: normalizeValue(u.address),
  city: normalizeValue(u.city),
  createdAt: u.created_at, updatedAt: u.updated_at,
});

const ensureStaffEmployeeId = async (user) => {
  if (!user || user.role !== 'staff') return user;
  if (user.employee_id && String(user.employee_id).trim()) return user;

  const nextId = await generateEmployeeId();
  await pool.query('UPDATE users SET employee_id = ? WHERE id = ?', [nextId, user.id]);
  return { ...user, employee_id: nextId };
};

const repairMissingUserDetails = async (user) => {
  if (!user) return user;

  const updates = {};

  if (user.role === 'staff') {
    const safeLocation = user.location && String(user.location).trim() ? user.location : 'Not assigned';
    const safePosition = user.staff_position && String(user.staff_position).trim() ? user.staff_position : 'Front Desk';
    const safeDepartment = user.department && String(user.department).trim() ? user.department : 'Front Office';
    const safeEmployeeId = user.employee_id && String(user.employee_id).trim() ? user.employee_id : await generateEmployeeId();

    if (user.location !== safeLocation) updates.location = safeLocation;
    if (user.staff_position !== safePosition) updates.staffPosition = safePosition;
    if (user.department !== safeDepartment) updates.department = safeDepartment;
    if (user.employee_id !== safeEmployeeId) updates.employeeId = safeEmployeeId;
  }

  if (user.role === 'user') {
    const safeContact = user.contact_number && String(user.contact_number).trim() ? user.contact_number : 'Not provided';
    const safeAddress = user.address && String(user.address).trim() ? user.address : 'Not provided';
    const safeCity = user.city && String(user.city).trim() ? user.city : 'Not provided';

    if (user.contact_number !== safeContact) updates.contactNumber = safeContact;
    if (user.address !== safeAddress) updates.address = safeAddress;
    if (user.city !== safeCity) updates.city = safeCity;
  }

  if (Object.keys(updates).length) {
    await User.update(user.id, updates);
    return await User.findById(user.id);
  }

  return user;
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const u = await User.findById(userId);
    if (!u) return res.status(404).json({ message: 'User not found' });

    const safeUpdates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      contactNumber: req.body.phone || req.body.contactNumber,
      address: req.body.address,
      city: req.body.city,
    };

    const updated = await User.update(userId, safeUpdates);
    res.json({ message: 'Profile updated successfully', user: formatUser(updated) });
  } catch (e) {
    console.error('Error updating profile:', e);
    res.status(500).json({ message: 'Error updating profile', error: e.message });
  }
};

const createGuestUser = async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role))
      return res.status(403).json({ message: 'Only admins and staff can create guest accounts.' });

    const { firstName, lastName, email, password, contactNumber, address, city } = req.body;
    if (!firstName || !lastName)
      return res.status(400).json({ message: 'First name and last name are required.' });

    const profile = buildGuestAutoProfile({
      firstName,
      lastName,
      contactNumber,
      address,
      city,
    }, { seed: Date.now() });

    const resolvedEmail = (email && String(email).trim()) || profile.email;
    const resolvedPassword = (password && String(password).trim()) || profile.password;

    if (await User.findByEmail(resolvedEmail))
      return res.status(400).json({ message: 'Guest email already exists.' });

    const hashed = await bcrypt.hash(resolvedPassword, 10);
    const created = await User.create({
      firstName,
      lastName,
      email: resolvedEmail,
      password: hashed,
      role: 'user',
      contactNumber: contactNumber || null,
      address: address || null,
      city: city || null,
    });

    res.status(201).json({ message: 'Guest account created successfully.', user: formatUser(created) });
  } catch (e) {
    res.status(500).json({ message: 'Error creating guest account', error: e.message });
  }
};

const createStaffUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admins can create staff accounts.' });

    const { firstName, lastName, email, password, staffPosition, department, location, employeeId } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: 'First name, last name, email, and password are required.' });
    if (!location || !String(location).trim())
      return res.status(400).json({ message: 'Location / residence is required for staff accounts.' });

    if (await User.findByEmail(email))
      return res.status(400).json({ message: 'Staff email already exists.' });

    const resolvedPosition = staffPosition || 'Front Desk';
    const generatedEmployeeId = employeeId || (await generateEmployeeId());
    const hashed = await bcrypt.hash(password, 10);
    const created = await User.create({
      firstName, lastName, email, password: hashed, role: 'staff',
      staffPosition: resolvedPosition,
      department: department || null,
      location: location || null,
      employeeId: generatedEmployeeId,
    });

    res.status(201).json({ message: 'Staff account created successfully.', user: formatUser(created) });
  } catch (e) {
    res.status(500).json({ message: 'Error creating staff account', error: e.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const visibleUsers = req.user && req.user.role === 'staff'
      ? users.filter((user) => isGuestAccountRole(user.role))
      : users;

    const repaired = [];
    for (const user of visibleUsers) {
      const fixed = await repairMissingUserDetails(await ensureStaffEmployeeId(user));
      repaired.push(formatUser(fixed));
    }
    res.json(repaired);
  } catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const getUserById = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    if (req.user.role === 'staff' && !isGuestAccountRole(u.role)) {
      return res.status(403).json({ message: 'Staff can only view guest accounts.' });
    }
    const fixed = await repairMissingUserDetails(await ensureStaffEmployeeId(u));
    res.json(formatUser(fixed));
  } catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const updateUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });

    if (req.user.role === 'staff' && !isGuestAccountRole(u.role)) {
      return res.status(403).json({ message: 'Staff can only edit guest accounts.' });
    }

    if (req.body.role !== undefined) {
      if (req.user.role !== 'admin')
        return res.status(403).json({ message: 'Only the admin can change roles.' });
      if (req.body.role !== 'staff' && req.body.role !== 'user')
        return res.status(400).json({ message: 'Only staff and user roles are allowed.' });
      if (req.body.role === 'admin')
        return res.status(400).json({ message: 'Admin role cannot be assigned here.' });
    }

    const safeUpdates = { ...req.body };
    if (safeUpdates.role === 'admin') delete safeUpdates.role;

    if (u.role === 'staff') {
      if (safeUpdates.location === '' || safeUpdates.location === undefined) {
        safeUpdates.location = u.location || 'Not assigned';
      }
      if (safeUpdates.employeeId === '' || safeUpdates.employeeId === undefined) {
        safeUpdates.employeeId = u.employee_id || (await generateEmployeeId());
      }
    }

    if (u.role !== 'staff') {
      if (safeUpdates.address === '' || safeUpdates.address === undefined) {
        safeUpdates.address = u.address || 'Not provided';
      }
      if (safeUpdates.city === '' || safeUpdates.city === undefined) {
        safeUpdates.city = u.city || 'Not provided';
      }
      if (safeUpdates.contactNumber === '' || safeUpdates.contactNumber === undefined) {
        safeUpdates.contactNumber = u.contact_number || 'Not provided';
      }
    }

    const updated = await User.update(req.params.id, safeUpdates);
    res.json({ message: 'User updated', user: formatUser(await ensureStaffEmployeeId(updated)) });
  } catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const deleteUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    if (req.user.role === 'staff' && !isGuestAccountRole(target.role)) {
      return res.status(403).json({ message: 'Staff can only delete guest accounts.' });
    }

    const u = await User.deleteById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

module.exports = {
  generateEmployeeId,
  isGuestAccountRole,
  buildGuestAutoProfile,
  createGuestUser,
  createStaffUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateProfile,
  deleteUser,
};