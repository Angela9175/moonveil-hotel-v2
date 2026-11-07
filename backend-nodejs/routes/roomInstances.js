const router = require('express').Router();
const {
  getAllRoomInstances, getRoomInstancesByType, getAvailableRoomInstances,
  createRoomInstance, updateRoomInstance, deleteRoomInstance,
} = require('../controllers/roomInstanceController');
const { admin } = require('../middleware/auth');

router.get('/', getAllRoomInstances);
router.get('/available', getAvailableRoomInstances);
router.get('/type/:typeId', getRoomInstancesByType);
router.post('/', admin, createRoomInstance);
router.put('/:id', admin, updateRoomInstance);
router.delete('/:id', admin, deleteRoomInstance);

module.exports = router;