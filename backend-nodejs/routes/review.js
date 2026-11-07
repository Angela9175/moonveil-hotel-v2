const express = require('express');
const router = express.Router();
const { pool: db } = require('../config/db');
const { adminOrStaff } = require('../middleware/auth');

// Get all reviews (Admin/Staff view)
router.get('/', adminOrStaff, async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM reviews ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Post a new review (Guest side)
router.post('/', async (req, res, next) => {
  try {
    const { guest_name, room_name, rating, comment } = req.body;
    const [result] = await db.query(
      'INSERT INTO reviews (guest_name, room_name, rating, comment) VALUES (?, ?, ?, ?)',
      [guest_name || 'Anonymous Guest', room_name || 'Standard Room', rating || 5, comment || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// Delete a review (Admin/Staff action)
router.delete('/:id', adminOrStaff, async (req, res, next) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;