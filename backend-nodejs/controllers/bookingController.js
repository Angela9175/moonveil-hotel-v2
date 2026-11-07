const Booking = require('../models/Booking');
const BookingCharge = require('../models/BookingCharge');
const User = require('../models/User');
const { pool } = require('../config/db');
const { normalizePaymentMethod, getPaymentStatusForMethod } = require('../utils/paymentPolicy');

const formatBooking = (b) => ({
  _id: b.id,
  id: b.id,
  userId: b.user_id,
  roomId: b.room_id || b.roomId,
  roomInstanceId: b.room_instance_id,
  roomName: b.room_name || b.roomName,
  roomNumber: b.room_number || b.roomNumber,
  floor: b.floor,
  guestName: b.guest_name || b.guestName,
  guestEmail: b.guest_email || b.guestEmail,
  guestPhone: b.guest_phone || b.guestPhone,
  guestAddress: b.guest_address || b.guestAddress,
  guestCity: b.guest_city || b.guestCity,
  bookingDate: b.booking_date || b.bookingDate,
  bookingReference: b.booking_reference || b.bookingReference,
  checkIn: b.check_in || b.checkIn,
  checkOut: b.check_out || b.checkOut,
  checkedInAt: b.checked_in_at,
  checkedOutAt: b.checked_out_at,
  guests: b.guests,
  adults: b.adults,
  children: b.children,
  specialRequests: b.special_requests || b.specialRequests,
  totalPrice: parseFloat(b.total_price || b.totalPrice || 0),
  downpaymentAmount: parseFloat(b.downpayment_amount || b.downpaymentAmount || 0),
  remainingBalance: parseFloat(b.remaining_balance || b.remainingBalance || 0),
  extraTotal: parseFloat(b.extra_total || 0),
  grandTotal: parseFloat(b.grand_total ?? b.total_price ?? b.totalPrice ?? 0),
  status: b.status,
  paymentStatus: b.payment_status || b.paymentStatus,
  paymentMethod: b.payment_method || b.paymentMethod,
  paymentDate: b.payment_date || b.paymentDate,
  notes: b.notes,
  cancelledAt: b.cancelled_at,
  cancelledBy: b.cancelled_by,
  cancellationReason: b.cancellation_reason,
  rating: b.rating ? Number(b.rating) : null,
  reviewComment: b.review_comment || b.reviewComment || '',
  createdAt: b.created_at || b.createdAt,
  updatedAt: b.updated_at || b.updatedAt,
  roomImage: b.room_image || b.roomImage || '',
  roomAmenities: b.room_amenities || b.roomAmenities || '',
  roomDescription: b.room_description || b.roomDescription || '',
  maxGuests: b.capacity || b.max_guests || b.maxGuests || 2,
  bedType: b.bed_type || b.bedType || '1 King Bed',
  roomType: b.room_type || b.roomType || 'Standard',
});

const getAllBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = (req.user.role || '').toLowerCase();

    let query = `
      SELECT 
        b.id,
        b.room_id AS roomId,
        b.user_id AS userId,
        COALESCE(r.name, b.room_name, 'Room') AS roomName,
        COALESCE(b.guest_name, CONCAT(u.first_name, ' ', u.last_name), 'Guest') AS guestName,
        b.check_in AS checkIn,
        b.check_out AS checkOut,
        COALESCE(b.total_price, 0) AS totalPrice,
        COALESCE(b.downpayment_amount, 0) AS downpaymentAmount,
        COALESCE(b.remaining_balance, 0) AS remainingBalance,
        COALESCE(b.status, 'Confirmed') AS status,
        COALESCE(b.payment_status, 'Pending') AS paymentStatus,
        COALESCE(b.booking_reference, CONCAT('BK-', b.id)) AS bookingReference,
        b.room_number AS roomNumber,
        b.floor,
        b.rating,
        b.review_comment AS reviewComment,
        r.image AS roomImage,
        r.amenities AS roomAmenities,
        r.description AS roomDescription,
        COALESCE(r.capacity, 2) AS maxGuests,
        '1 King Bed' AS bedType,
        'Standard' AS roomType
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      LEFT JOIN users u ON b.user_id = u.id
    `;

    let params = [];
    if (userRole !== 'admin' && userRole !== 'staff') {
      query += ` WHERE b.user_id = ?`;
      params.push(userId);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows] = await pool.query(query, params);
    res.json((rows || []).map(formatBooking));
  } catch (e) {
    console.error('Error fetching bookings:', e);
    res.status(500).json({ message: 'Error fetching bookings', error: e.message });
  }
};

const getAllBookingsAdmin = async (_req, res) => {
  try {
    const rows = await Booking.findAll();
    res.json((rows || []).map(formatBooking));
  } catch (e) {
    res.status(500).json({ message: 'Error fetching bookings', error: e.message });
  }
};

const getPaymentHistory = async (_req, res) => {
  try {
    const paid = await Booking.findPaid();
    const totalRevenue = (paid || []).reduce((s, b) => s + parseFloat(b.total_price || 0), 0);
    const pendingCount = await Booking.countPendingPayments();
    const payments = (paid || []).map(b => ({
      bookingId: b.id,
      roomName: b.room_name,
      roomNumber: b.room_number || 'N/A',
      guestName: b.user_first_name ? `${b.user_first_name} ${b.user_last_name}` : b.guest_name,
      guestEmail: b.user_email || b.guest_email,
      checkIn: b.check_in,
      checkOut: b.check_out,
      totalPrice: parseFloat(b.total_price || 0),
      paymentDate: b.payment_date,
      paymentMethod: b.payment_method,
      status: b.status,
    }));
    res.json({ totalRevenue, totalTransactions: (paid || []).length, pendingCount, payments });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUserId(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const charges = await BookingCharge.findByBooking(booking.id);
    res.json({ ...formatBooking(booking), charges });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const getBookingByIdAdmin = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const charges = await BookingCharge.findByBooking(booking.id);
    res.json({ ...formatBooking(booking), charges });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      roomId: roomIdStr, checkIn, checkOut,
      bookingDate, bookingReference, adults, children, guests, specialRequests, totalPrice,
      roomName, paymentMethod, paymentStatus, paymentType, extraCharges,
      guestName: guestNameInput, guestPhone: guestPhoneInput, guestEmail: guestEmailInput,
      guestAddress: guestAddressInput, guestCity: guestCityInput,
      guestId: guestIdInput, notes,
      floor, roomNumber,
    } = req.body;

    if (!checkIn || !checkOut) return res.status(400).json({ message: 'Dates required' });
    if (new Date(checkOut) <= new Date(checkIn)) return res.status(400).json({ message: 'Check-out must be after check-in.' });

    const roomId = parseInt(roomIdStr);
    const guestId = guestIdInput ? Number(guestIdInput) : null;
    const userId = guestId || req.user.id;
    if (!userId || !roomId) return res.status(400).json({ message: 'User and Room required' });

    const conflictingBooking = await Booking.findConflicts(roomId, checkIn, checkOut);
    if (conflictingBooking && conflictingBooking.length) {
      return res.status(409).json({
        message: `Room is already booked for the selected dates. Please choose another date or room.`,
      });
    }

    const guestUser = guestId ? await User.findById(guestId) : null;
    const a = Math.max(1, Number(adults) || Number(guests) || 1);
    const c = Math.max(0, Number(children) || 0);
    const totalGuests = a + c;

    const guestName = (guestNameInput || '').trim() || (guestUser ? `${guestUser.first_name} ${guestUser.last_name}`.trim() : 'Guest');
    const guestEmail = guestEmailInput || (guestUser ? guestUser.email : req.user.email) || 'guest@example.com';
    const guestPhone = guestPhoneInput || (guestUser ? guestUser.contact_number : req.user.phone) || '';
    const guestAddress = guestAddressInput || (guestUser ? guestUser.address : '') || '';
    const guestCity = guestCityInput || (guestUser ? guestUser.city : '') || '';

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    
    let resolvedPaymentStatus = getPaymentStatusForMethod(normalizedPaymentMethod, paymentStatus);
    const rawMethod = String(paymentMethod || '').toLowerCase();
    const normMethod = String(normalizedPaymentMethod || '').toLowerCase();

    if (
      rawMethod.includes('gcash') || 
      rawMethod.includes('paymaya') || 
      rawMethod.includes('card') ||
      normMethod.includes('gcash') || 
      normMethod.includes('paymaya') ||
      normMethod.includes('card')
    ) {
      resolvedPaymentStatus = 'Paid';
    }

    const addOnCharges = Number(extraCharges) || 0;
    const totalWithExtras = Number(totalPrice || 0) + addOnCharges;
    
    const isFullPayment = paymentType === 'full';
    const downpaymentAmount = isFullPayment ? totalWithExtras : totalWithExtras * 0.50;
    const remainingBalance = isFullPayment ? 0 : totalWithExtras - downpaymentAmount;

    const reservationDate = bookingDate || new Date();
    const resolvedReference = bookingReference || `BK-${Date.now()}`;

    const cleanFloor = floor ? parseInt(String(floor).replace(/\D/g, ''), 10) || 3 : 3;
    const cleanRoomNumber = roomNumber ? String(roomNumber).replace('Room ', '').trim() : '301';

    const newBooking = await Booking.create({
      userId, 
      roomId,
      roomName: roomName || 'Room',
      floor: cleanFloor,
      room_number: cleanRoomNumber,
      guestName, 
      guestEmail, 
      guestPhone, 
      guestAddress, 
      guestCity,
      checkIn, 
      checkOut,
      bookingDate: reservationDate,
      bookingReference: resolvedReference,
      guests: totalGuests, 
      adults: a, 
      children: c,
      specialRequests: specialRequests || '',
      totalPrice: totalWithExtras,
      downpaymentAmount: downpaymentAmount,
      remainingBalance: remainingBalance,
      extraCharges: addOnCharges,
      status: 'Confirmed',
      paymentStatus: resolvedPaymentStatus,
      paymentMethod: normalizedPaymentMethod,
      paymentDate: resolvedPaymentStatus === 'Paid' ? new Date() : null,
      notes: notes || '',
    });

    const full = await Booking.findById(newBooking.id);
    const message = isFullPayment
      ? 'Full payment successful! Booking confirmed.'
      : 'Downpayment successful! Booking confirmed.';

    res.status(201).json({ message, booking: formatBooking(full) });
  } catch (e) {
    console.error('Booking creation error:', e);
    res.status(500).json({ message: e.message || 'Error creating booking' });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUserId(req.params.id, req.user.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const updated = await Booking.update(req.params.id, req.body);
    res.json({ message: 'Booking updated', booking: formatBooking(updated) });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const updateBookingAdmin = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const { status } = req.body;
    if (status === 'Completed') {
      const now = new Date();
      if (now < new Date(booking.check_out))
        return res.status(400).json({ message: 'Cannot complete future booking.' });
      if (booking.payment_status !== 'Paid')
        return res.status(400).json({ message: 'Cannot complete unpaid booking.' });
    }

    const updated = await Booking.update(req.params.id, req.body);
    res.json({ message: 'Booking updated', booking: formatBooking(updated) });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const b = await Booking.deleteByIdAndUserId(req.params.id, req.user.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking cancelled' });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const deleteBookingAdmin = async (req, res) => {
  try {
    const b = await Booking.deleteById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && b.user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });
    if (b.status === 'Cancelled') return res.json({ message: 'Already cancelled' });

    const updated = await Booking.update(req.params.id, {
      status: 'Cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.user.id,
      cancellationReason: req.body.reason || 'Cancelled by user',
    });
    res.json({ message: 'Booking cancelled', booking: formatBooking(updated) });
  } catch (e) {
    res.status(500).json({ message: 'Error cancelling', error: e.message });
  }
};

const payBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id);
    if (!b) return res.status(404).json({ message: 'Booking not found' });
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && b.user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    const updated = await Booking.update(req.params.id, {
      paymentStatus: 'Paid',
      paymentDate: new Date(),
      status: 'Confirmed',
    });
    res.json({ message: 'Payment recorded', booking: formatBooking(updated) });
  } catch (e) {
    res.status(500).json({ message: 'Error recording payment', error: e.message });
  }
};

const addBookingReview = async (req, res) => {
  try {
    const { rating, comment, guestName, roomName, roomId } = req.body;
    
    if (pool) {
      await pool.query(
        `INSERT INTO reviews (room_id, room_name, guest_name, rating, comment, created_at, user_id)
         VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
        [roomId || null, roomName || 'Room', guestName || 'Guest', Number(rating) || 5, comment || '', req.user.id]
      );
    }

    try {
      await Booking.update(req.params.id, {
        rating: Number(rating),
        reviewComment: comment || '',
      });
    } catch (err) {
      // Gracefully skip if booking columns don't exist
    }

    res.json({ message: 'Review submitted successfully!' });
  } catch (e) {
    console.error('Error submitting review:', e);
    res.status(500).json({ message: 'Error submitting review', error: e.message });
  }
};

const getBookingCharges = async (req, res) => {
  try {
    const { id } = req.params;
    const charges = await BookingCharge.findByBooking(id);
    res.json(charges);
  } catch (e) {
    res.status(500).json({ message: 'Error fetching charges', error: e.message });
  }
};

const addCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body;
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const charge = await BookingCharge.create({
      bookingId: id,
      description: description || 'Additional Charge',
      amount: parseFloat(amount) || 0,
    });

    const charges = await BookingCharge.findByBooking(id);
    res.status(201).json({ message: 'Charge added successfully', charge, charges });
  } catch (e) {
    res.status(500).json({ message: 'Error adding charge', error: e.message });
  }
};

const deleteCharge = async (req, res) => {
  try {
    const { id, chargeId } = req.params;
    await BookingCharge.deleteById(chargeId);
    const charges = await BookingCharge.findByBooking(id);
    res.json({ message: 'Charge removed successfully', charges });
  } catch (e) {
    res.status(500).json({ message: 'Error deleting charge', error: e.message });
  }
};

module.exports = {
  getAllBookings,
  getAllBookingsAdmin,
  getPaymentHistory,
  getBookingById,
  getBookingByIdAdmin,
  createBooking,
  updateBooking,
  updateBookingAdmin,
  deleteBooking,
  deleteBookingAdmin,
  cancelBooking,
  payBooking,
  addBookingReview,
  getBookingCharges,
  addCharge,
  deleteCharge,
};
