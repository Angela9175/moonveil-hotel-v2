const { pool } = require('../config/db');

const Booking = {
  async findAll() {
    const [rows] = await pool.query(`
      SELECT b.*, u.first_name AS user_first_name, u.last_name AS user_last_name, u.email AS user_email,
             r.name AS room_name, r.type AS room_type, r.price AS room_price,
             COALESCE(b.room_number, ri.room_number) AS room_number,
             COALESCE(b.floor, ri.floor) AS floor,
             v.extra_total, v.grand_total
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN room_instances ri ON b.room_instance_id = ri.id
      LEFT JOIN booking_totals v ON v.booking_id = b.id
      ORDER BY b.id ASC`);
    return rows;
  },

  async findByUserId(userId) {
    const [rows] = await pool.query(`
      SELECT b.*, r.name AS room_name, r.type AS room_type, r.price AS room_price,
             COALESCE(b.room_number, ri.room_number) AS room_number,
             COALESCE(b.floor, ri.floor) AS floor,
             v.extra_total, v.grand_total
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN room_instances ri ON b.room_instance_id = ri.id
      LEFT JOIN booking_totals v ON v.booking_id = b.id
      WHERE b.user_id = ?
      ORDER BY b.id ASC`, [userId]);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT b.*, r.name AS room_name, r.type AS room_type, r.price AS room_price,
             COALESCE(b.room_number, ri.room_number) AS room_number,
             COALESCE(b.floor, ri.floor) AS floor,
             v.extra_total, v.grand_total
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN room_instances ri ON b.room_instance_id = ri.id
      LEFT JOIN booking_totals v ON v.booking_id = b.id
      WHERE b.id = ?`, [id]);
    return rows[0] || null;
  },

  async findByIdAndUserId(id, userId) {
    const [rows] = await pool.query(`
      SELECT b.*, r.name AS room_name, r.type AS room_type, r.price AS room_price,
             COALESCE(b.room_number, ri.room_number) AS room_number,
             COALESCE(b.floor, ri.floor) AS floor,
             v.extra_total, v.grand_total
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN room_instances ri ON b.room_instance_id = ri.id
      LEFT JOIN booking_totals v ON v.booking_id = b.id
      WHERE b.id = ? AND b.user_id = ?`, [id, userId]);
    return rows[0] || null;
  },

  async findConflicts(roomId, checkIn, checkOut, excludeId = null) {
    const [rows] = await pool.query(`
      SELECT * FROM bookings
      WHERE room_id = ?
        AND status <> 'Cancelled'
        AND check_in < ?
        AND check_out > ?
        ${excludeId ? 'AND id <> ?' : ''}
      ORDER BY id ASC`, excludeId ? [roomId, checkOut, checkIn, excludeId] : [roomId, checkOut, checkIn]);
    return rows;
  },

  async findPaid() {
    const [rows] = await pool.query(`
      SELECT b.*, u.first_name AS user_first_name, u.last_name AS user_last_name, u.email AS user_email,
             r.name AS room_name, 
             COALESCE(b.room_number, ri.room_number) AS room_number, 
             COALESCE(b.floor, ri.floor) AS floor
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN room_instances ri ON b.room_instance_id = ri.id
      WHERE b.payment_status = 'Paid'
      ORDER BY b.id ASC`);
    return rows;
  },

  async countPendingPayments() {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE payment_status = 'Pending'");
    return rows[0].count;
  },

  async create(data) {
    const {
      userId, roomId, roomInstanceId = null, roomName, roomNumber = null, floor = null,
      guestName, guestEmail, guestPhone = '', guestAddress = '', guestCity = '', checkIn, checkOut,
      bookingDate = null, bookingReference = null,
      guests = 1, adults = 1, children = 0,
      specialRequests = '', totalPrice = 0, downpaymentAmount = 0, remainingBalance = 0, extraCharges = 0,
      status = 'Pending', paymentStatus = 'Pending',
      paymentMethod = null, paymentDate = null,
      checkedInAt = null, checkedOutAt = null, notes = '',
    } = data;
    
    const [r] = await pool.query(
      `INSERT INTO bookings
        (user_id, room_id, room_instance_id, room_name, room_number, floor,
         guest_name, guest_email, guest_phone, guest_address, guest_city,
         check_in, check_out, booking_date, booking_reference,
         guests, adults, children, special_requests, total_price, downpayment_amount, remaining_balance, extra_charges,
         status, payment_status, payment_method, payment_date, checked_in_at, checked_out_at, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [userId, roomId, roomInstanceId, roomName, roomNumber, floor,
       guestName, guestEmail, guestPhone, guestAddress, guestCity,
       checkIn, checkOut, bookingDate, bookingReference,
       guests, adults, children, specialRequests, totalPrice, downpaymentAmount, remainingBalance, extraCharges,
       status, paymentStatus, paymentMethod, paymentDate, checkedInAt, checkedOutAt, notes]
    );
    return this.findById(r.insertId);
  },

  async update(id, updates) {
    const map = {
      roomId: 'room_id', roomInstanceId: 'room_instance_id',
      roomName: 'room_name', roomNumber: 'room_number', floor: 'floor',
      guestName: 'guest_name', guestEmail: 'guest_email', guestPhone: 'guest_phone',
      guestAddress: 'guest_address', guestCity: 'guest_city',
      checkIn: 'check_in', checkOut: 'check_out',
      bookingDate: 'booking_date', bookingReference: 'booking_reference',
      guests: 'guests', adults: 'adults', children: 'children',
      specialRequests: 'special_requests', totalPrice: 'total_price', 
      downpaymentAmount: 'downpayment_amount', remainingBalance: 'remaining_balance', 
      extraCharges: 'extra_charges',
      status: 'status', paymentStatus: 'payment_status',
      paymentMethod: 'payment_method', paymentDate: 'payment_date',
      checkedInAt: 'checked_in_at', checkedOutAt: 'checked_out_at',
      cancelledAt: 'cancelled_at', cancelledBy: 'cancelled_by',
      cancellationReason: 'cancellation_reason', notes: 'notes',
    };
    const fields = [], vals = [];
    for (const [k, col] of Object.entries(map)) {
      if (updates[k] !== undefined) { fields.push(`${col} = ?`); vals.push(updates[k]); }
    }
    if (!fields.length) return this.findById(id);
    vals.push(id);
    await pool.query(`UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`, vals);
    return this.findById(id);
  },

  async deleteById(id) {
    const [r] = await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    return r.affectedRows ? { id } : null;
  },

  async deleteByIdAndUserId(id, userId) {
    const [r] = await pool.query('DELETE FROM bookings WHERE id = ? AND user_id = ?', [id, userId]);
    return r.affectedRows ? { id } : null;
  },

  async deleteAll() { await pool.query('DELETE FROM bookings'); },
};

module.exports = Booking;