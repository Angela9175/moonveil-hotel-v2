const { pool } = require('../config/db');

const User = {
  async findAll() {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return rows;
  },
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },
  async create({ firstName, lastName, email, password, role = 'user', staffPosition = null, department = null, location = null, employeeId = null, contactNumber = null, address = null, city = null }) {
    const [r] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, staff_position, department, location, employee_id, contact_number, address, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, password, role, staffPosition, department, location, employeeId, contactNumber, address, city]
    );
    return this.findById(r.insertId);
  },
  async update(id, updates) {
    const fields = [], vals = [];
    if (updates.firstName !== undefined) { fields.push('first_name = ?'); vals.push(updates.firstName); }
    if (updates.lastName  !== undefined) { fields.push('last_name = ?');  vals.push(updates.lastName); }
    if (updates.email     !== undefined) { fields.push('email = ?');      vals.push(updates.email); }
    if (updates.password  !== undefined) { fields.push('password = ?');   vals.push(updates.password); }
    if (updates.role      !== undefined) { fields.push('role = ?');       vals.push(updates.role); }
    if (updates.staffPosition !== undefined) { fields.push('staff_position = ?'); vals.push(updates.staffPosition); }
    if (updates.department !== undefined) { fields.push('department = ?'); vals.push(updates.department); }
    if (updates.location !== undefined) { fields.push('location = ?'); vals.push(updates.location); }
    if (updates.employeeId !== undefined) { fields.push('employee_id = ?'); vals.push(updates.employeeId); }
    if (updates.contactNumber !== undefined) { fields.push('contact_number = ?'); vals.push(updates.contactNumber); }
    if (updates.address !== undefined) { fields.push('address = ?'); vals.push(updates.address); }
    if (updates.city !== undefined) { fields.push('city = ?'); vals.push(updates.city); }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },
  async deleteById(id) {
    const [r] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return r.affectedRows ? { id } : null;
  },
  async deleteAll() { await pool.query('DELETE FROM users'); },
};

module.exports = User;