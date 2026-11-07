const router = require('express').Router();
const {
  getAllBookings, getBookingById, createBooking, updateBooking,
  deleteBooking, cancelBooking, payBooking,
  addCharge, deleteCharge, getBookingCharges,
  addBookingReview, // <-- 1. Import the review controller
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, getAllBookings);
router.post('/', protect, createBooking);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, deleteBooking);
router.post('/:id/cancel', protect, cancelBooking);
router.post('/:id/pay', protect, payBooking);
router.post('/:id/review', protect, addBookingReview); // <-- 2. Add the review route here

router.get('/:id/charges', protect, getBookingCharges);
router.post('/:id/charges', protect, admin, addCharge);
router.delete('/:id/charges/:chargeId', protect, admin, deleteCharge);

module.exports = router;