const { pool } = require('../config/db');

const RoomInstance = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT ri.*, r.name AS room_name, r.type AS room_type, r.price AS room_price
      FROM room_instances ri
      LEFT JOIN rooms r ON ri.type_id = r.id
      ORDER BY ri.id ASC`);
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query(`
      SELECT ri.*, r.name AS room_name, r.type AS room_type, r.price AS room_price
      FROM room_instances ri
      LEFT JOIN rooms r ON ri.type_id = r.id
      WHERE ri.id = ?`, [id]);
    return rows[0] || null;
  },
  async findByTypeId(typeId) {
    const [rows] = await pool.query(`
      SELECT ri.*, r.name AS room_name, r.type AS room_type, r.price AS room_price
      FROM room_instances ri
      LEFT JOIN rooms r ON ri.type_id = r.id
      WHERE ri.type_id = ?`, [typeId]);
    return rows;
  },
  async findAvailable() {
    const [rows] = await pool.query(`
      SELECT ri.*, r.name AS room_name, r.type AS room_type, r.price AS room_price
      FROM room_instances ri
      LEFT JOIN rooms r ON ri.type_id = r.id
      WHERE ri.status = 'Available'`);
    return rows;
  },
  async create({ typeId, roomNumber, floor, typeName = '', price = 0, status = 'Available' }) {
    const [r] = await pool.query(
      `INSERT INTO room_instances (type_id, room_number, floor, type_name, price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [typeId, roomNumber, floor, typeName, price, status]
    );
    return this.findById(r.insertId);
  },
  async update(id, updates) {
    const fields = [], vals = [];
    if (updates.typeId     !== undefined) { fields.push('type_id = ?');     vals.push(updates.typeId); }
    if (updates.roomNumber !== undefined) { fields.push('room_number = ?'); vals.push(updates.roomNumber); }
    if (updates.typeName   !== undefined) { fields.push('type_name = ?');   vals.push(updates.typeName); }
    if (updates.price      !== undefined) { fields.push('price = ?');       vals.push(updates.price); }
    if (updates.status     !== undefined) { fields.push('status = ?');      vals.push(updates.status); }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await pool.query(`UPDATE room_instances SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async deleteById(id) {
    const [r] = await pool.query('DELETE FROM room_instances WHERE id = ?', [id]);
    return r.affectedRows ? { id } : null;
  },
  async deleteAll() { await pool.query('DELETE FROM room_instances'); },
};

module.exports = RoomInstance;