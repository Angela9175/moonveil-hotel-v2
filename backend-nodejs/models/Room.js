const { pool } = require('../config/db');

const Room = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY id ASC');
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async create({ name, type, price, description, amenities = [], image = '', rating = 0, available = true, bookings = 0, capacity = 2, allowed_floors = '1,2,3' }) {
    const [r] = await pool.query(
      `INSERT INTO rooms (name, type, price, description, amenities, image, rating, available, bookings, capacity, allowed_floors) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, price, description, JSON.stringify(amenities), image, rating, available ? 1 : 0, bookings, capacity, allowed_floors]
    );
    return this.findById(r.insertId);
  },
  async update(id, updates) {
    const fields = [], vals = [];
    if (updates.name          !== undefined) { fields.push('name = ?');          vals.push(updates.name); }
    if (updates.type          !== undefined) { fields.push('type = ?');          vals.push(updates.type); }
    if (updates.price         !== undefined) { fields.push('price = ?');         vals.push(updates.price); }
    if (updates.description   !== undefined) { fields.push('description = ?');   vals.push(updates.description); }
    if (updates.amenities     !== undefined) { fields.push('amenities = ?');     vals.push(JSON.stringify(updates.amenities)); }
    if (updates.image         !== undefined) { fields.push('image = ?');         vals.push(updates.image); }
    if (updates.rating        !== undefined) { fields.push('rating = ?');        vals.push(updates.rating); }
    if (updates.available     !== undefined) { fields.push('available = ?');     vals.push(updates.available ? 1 : 0); }
    if (updates.bookings      !== undefined) { fields.push('bookings = ?');      vals.push(updates.bookings); }
    if (updates.capacity      !== undefined) { fields.push('capacity = ?');      vals.push(updates.capacity); }
    if (updates.allowed_floors !== undefined) { fields.push('allowed_floors = ?'); vals.push(updates.allowed_floors); }
    
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await pool.query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async deleteById(id) {
    const [r] = await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    return r.affectedRows ? { id } : null;
  },
  async deleteAll() { await pool.query('DELETE FROM rooms'); },

  async findImages(roomId) {
    const [rows] = await pool.query(
      'SELECT * FROM room_images WHERE room_id = ? ORDER BY sort_order, id', [roomId]);
    return rows;
  },
  async addImage({ roomId, imageUrl, angleLabel = null, sortOrder = 0 }) {
    const [r] = await pool.query(
      'INSERT INTO room_images (room_id, image_url, angle_label, sort_order) VALUES (?,?,?,?)',
      [roomId, imageUrl, angleLabel, sortOrder]);
    return { id: r.insertId };
  },
  async deleteImage(imageId, roomId) {
    await pool.query('DELETE FROM room_images WHERE id = ? AND room_id = ?', [imageId, roomId]);
  }
};

module.exports = Room;