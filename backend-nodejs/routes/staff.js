const router = require('express').Router();
const { staff } = require('../middleware/auth');
const {
  getAllBookingsAdmin,
  getBookingByIdAdmin,
  updateBookingAdmin,
} = require('../controllers/bookingController');
const { getStats } = require('../controllers/adminController');
const { createGuestUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { createBooking } = require('../controllers/bookingController');

router.use(staff);

router.get('/bookings', getAllBookingsAdmin);
router.post('/bookings', createBooking);
router.get('/bookings/:id', getBookingByIdAdmin);
router.put('/bookings/:id', updateBookingAdmin);
router.get('/stats', getStats);

router.post('/guests', createGuestUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
