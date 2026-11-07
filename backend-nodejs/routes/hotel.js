const router = require('express').Router();
const { getInfo, getSettings } = require('../controllers/hotelController');

router.get('/info', getInfo);
router.get('/settings', getSettings);

module.exports = router;