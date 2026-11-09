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

// ─── 3. HOTEL INQUIRIES & CONTACT US ENDPOINTS ───────────────────
app.get('/api/inquiries', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    
    if (!firstName || !email || !message) {
      return res.status(400).json({ error: 'First name, email, and message are required.' });
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100),
          email VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('Pending', 'Resolved', 'Archived') DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {}

    const query = `
      INSERT INTO inquiries (first_name, last_name, email, message, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [firstName, lastName || '', email, message];
    
    const [result] = await pool.query(query, values);
    const [created] = await pool.query('SELECT * FROM inquiries WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0] || { id: result.insertId, firstName, lastName, email, message });
  } catch (err) {
    console.error('Error saving inquiry:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

app.patch('/api/inquiries/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Inquiry status updated successfully' });
  } catch (err) {
    console.error('Error updating inquiry status:', err);
    res.status(500).json({ error: 'Failed to update inquiry status' });
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

      await pool.query(`
        CREATE TABLE IF NOT EXISTS inquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100),
          email VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('Pending', 'Resolved', 'Archived') DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
  } catch (e) {
    console.error('❌ Failed to start backend:', e);
    process.exit(1);
  }
})();