const router = require('express').Router();
const {
  getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom,
  addRoomImage, deleteRoomImage, getAvailabilityCalendar,
} = require('../controllers/roomController');
const { admin } = require('../middleware/auth');

router.get('/', getAllRooms);
router.get('/availability', getAvailabilityCalendar);
router.get('/:id', getRoomById);
router.post('/', admin, createRoom);
router.put('/:id', admin, updateRoom);
router.delete('/:id', admin, deleteRoom);
router.post('/:id/images', admin, addRoomImage);
router.delete('/:roomId/images/:imageId', admin, deleteRoomImage);

module.exports = router;