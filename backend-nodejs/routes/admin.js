const router = require('express').Router();
const { admin } = require('../middleware/auth');
const {
  getAllBookingsAdmin, getBookingByIdAdmin, updateBookingAdmin, deleteBookingAdmin,
  getPaymentHistory,
} = require('../controllers/bookingController');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const {
  getStats, getHotelInfo, saveHotelInfo, getSettings, saveSettings,
} = require('../controllers/adminController');

router.use(admin);

router.get('/bookings', getAllBookingsAdmin);
router.get('/bookings/:id', getBookingByIdAdmin);
router.put('/bookings/:id', updateBookingAdmin);
router.delete('/bookings/:id', deleteBookingAdmin);
router.get('/payments', getPaymentHistory);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/stats', getStats);
router.get('/hotel-info', getHotelInfo);
router.put('/hotel-info', saveHotelInfo);
router.get('/settings', getSettings);
router.put('/settings', saveSettings);

module.exports = router;