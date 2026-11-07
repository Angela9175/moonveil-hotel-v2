const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB, pool } = require('./config/db');
const { adminOrStaff } = require('./middleware/auth');
const { addCharge, deleteCharge } = require('./controllers/bookingController');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── 1. PUT CHARGE ROUTES AT THE VERY TOP ─────────────────────────
app.post('/api/bookings/:id/charges', adminOrStaff, addCharge);
app.delete('/api/bookings/:id/charges/:chargeId', adminOrStaff, deleteCharge);
// ──────────────────────────────────────────────────────────────────

// ─── 2. CUSTOMER REVIEWS & FEEDBACK ENDPOINTS ─────────────────────
app.get('/api/reviews', async (req, res) => {
  try {
    const { roomId } = req.query;
    let query = 'SELECT * FROM reviews';
    let params = [];

    if (roomId) {
      query += ' WHERE room_id = ? OR roomid = ?';
      params.push(roomId, roomId);
    }
    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { roomId, roomName, guestName, rating, comment } = req.body;
    
    if (!guestName || !rating || !comment) {
      return res.status(400).json({ error: 'Guest name, rating, and comment are required.' });
    }

    // Automatically ensure table and all required columns exist dynamically
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          room_id INT,
          room_name VARCHAR(255),
          guest_name VARCHAR(255),
          rating INT,
          comment TEXT,
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {}

    try { await pool.query("ALTER TABLE reviews ADD COLUMN room_id INT"); } catch (e) {}
    try { await pool.query("ALTER TABLE reviews ADD COLUMN room_name VARCHAR(255)"); } catch (e) {}
    try { await pool.query("ALTER TABLE reviews ADD COLUMN guest_name VARCHAR(255)"); } catch (e) {}
    try { await pool.query("ALTER TABLE reviews ADD COLUMN rating INT"); } catch (e) {}
    try { await pool.query("ALTER TABLE reviews ADD COLUMN comment TEXT"); } catch (e) {}
    try { await pool.query("ALTER TABLE reviews ADD COLUMN user_id INT"); } catch (e) {}
    try { await pool.query("ALTER TABLE reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); } catch (e) {}

    const query = `
      INSERT INTO reviews (room_id, room_name, guest_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const values = [roomId || null, roomName || 'Room', guestName, rating, comment];
    
    const [result] = await pool.query(query, values);
    const [created] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0] || { id: result.insertId, roomId, roomName, guestName, rating, comment });
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = ? OR _id = ?', [id, id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});
// ──────────────────────────────────────────────────────────────────

app.use('/api/auth',           require('./routes/auth'));
app.use('/api/rooms',          require('./routes/rooms'));
app.use('/api/room-instances', require('./routes/roomInstances'));
app.use('/api/bookings',       require('./routes/bookings'));
app.use('/api/users',          require('./routes/users'));
app.use('/api/staff',          require('./routes/staff'));
app.use('/api/admin',          require('./routes/admin'));
app.use('/api/hotel',          require('./routes/hotel'));

app.get('/', (_req, res) => res.json({ ok: true, service: 'moonveil-hotel-api' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDB();

    if (pool) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INT AUTO_INCREMENT PRIMARY KEY,
          room_id INT,
          room_name VARCHAR(255),
          guest_name VARCHAR(255),
          rating INT,
          comment TEXT,
          user_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      try { await pool.query("ALTER TABLE reviews ADD COLUMN room_id INT"); } catch (e) {}
      try { await pool.query("ALTER TABLE reviews ADD COLUMN room_name VARCHAR(255)"); } catch (e) {}
      try { await pool.query("ALTER TABLE reviews ADD COLUMN guest_name VARCHAR(255)"); } catch (e) {}
      try { await pool.query("ALTER TABLE reviews ADD COLUMN rating INT"); } catch (e) {}
      try { await pool.query("ALTER TABLE reviews ADD COLUMN comment TEXT"); } catch (e) {}
      try { await pool.query("ALTER TABLE reviews ADD COLUMN user_id INT"); } catch (e) {}
      try { await pool.query("ALTER TABLE reviews ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"); } catch (e) {}
    }

    app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
  } catch (e) {
    console.error('❌ Failed to start backend:', e);
    process.exit(1);
  }
})();