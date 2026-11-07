const { pool } = require('../config/db');

const BookingCharge = {
  async findByBooking(bookingId) {
    const [rows] = await pool.query(
      'SELECT * FROM booking_charges WHERE booking_id = ? ORDER BY id', [bookingId]);
    return rows;
  },
  async create({ bookingId, chargeType = 'extra_service', description, quantity = 1, amount, addedBy = null }) {
    const [r] = await pool.query(
      `INSERT INTO booking_charges (booking_id, charge_type, description, quantity, amount, added_by)
       VALUES (?,?,?,?,?,?)`,
      [bookingId, chargeType, description, quantity, amount, addedBy]);
    return { id: r.insertId };
  },
  async delete(id) {
    await pool.query('DELETE FROM booking_charges WHERE id = ?', [id]);
  },
  async totalForBooking(bookingId) {
    const [rows] = await pool.query(
      'SELECT COALESCE(SUM(quantity * amount),0) AS total FROM booking_charges WHERE booking_id = ?',
      [bookingId]);
    return Number(rows[0].total);
  },
};

module.exports = BookingCharge;