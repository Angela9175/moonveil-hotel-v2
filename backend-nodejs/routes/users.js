const router = require('express').Router();
const { 
  createStaffUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  updateProfile, 
  deleteUser 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.post('/staff', protect, admin, createStaffUser);
router.get('/', protect, admin, getAllUsers);

// Profile route MUST come before /:id to prevent route conflicts
router.put('/profile', protect, updateProfile);

router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;