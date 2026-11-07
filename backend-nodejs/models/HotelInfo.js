const { pool } = require('../config/db');

const HotelInfo = {
  async get() {
    const [rows] = await pool.query('SELECT * FROM hotel_info ORDER BY id LIMIT 1');
    return rows[0] || null;
  },
  async save({ name, address, phone, email, description, check_in_time, check_out_time }) {
    const existing = await this.get();
    if (existing) {
      await pool.query(
        `UPDATE hotel_info SET name=?, address=?, phone=?, email=?, description=?,
         check_in_time=?, check_out_time=? WHERE id=?`,
        [name, address, phone, email, description, check_in_time, check_out_time, existing.id]);
    } else {
      await pool.query(
        `INSERT INTO hotel_info (name,address,phone,email,description,check_in_time,check_out_time)
         VALUES (?,?,?,?,?,?,?)`,
        [name, address, phone, email, description, check_in_time, check_out_time]);
    }
  },
};

module.exports = HotelInfo;