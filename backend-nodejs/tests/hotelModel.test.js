const assert = require('node:assert/strict');
const { pool, initDB } = require('../config/db');

(async () => {
  await initDB();

  const [userCols] = await pool.query('SHOW COLUMNS FROM users');
  const userFields = userCols.map((c) => c.Field);

  assert.ok(userFields.includes('staff_position'), 'users.staff_position is missing');
  assert.ok(userFields.includes('department'), 'users.department is missing');
  assert.ok(userFields.includes('employee_id'), 'users.employee_id is missing');

  const [bookingCols] = await pool.query('SHOW COLUMNS FROM bookings');
  const bookingFields = bookingCols.map((c) => c.Field);

  assert.ok(bookingFields.includes('booking_date'), 'bookings.booking_date is missing');
  assert.ok(bookingFields.includes('booking_reference'), 'bookings.booking_reference is missing');
  assert.ok(bookingFields.includes('checked_in_at'), 'bookings.checked_in_at is missing');
  assert.ok(bookingFields.includes('checked_out_at'), 'bookings.checked_out_at is missing');

  console.log('Hotel model fields verified.');
  await pool.end();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
