const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const HotelInfo = require('../models/HotelInfo');
const SystemSettings = require('../models/SystemSettings');

const getStats = async (_req, res) => {
  try {
    const [bookings, rooms, users] = await Promise.all([
      Booking.findAll(), Room.findAll(), User.findAll(),
    ]);
    const totalBookings = bookings.length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const cancelled = bookings.filter(b => b.status === 'Cancelled').length;
    const revenue = bookings
      .filter(b => b.payment_status === 'Paid')
      .reduce((s, b) => s + parseFloat(b.grand_total ?? b.total_price ?? 0), 0);

    res.json({
      totalBookings, pending, cancelled,
      rooms: rooms.length, users: users.length,
      revenue,
    });
  } catch (e) {
    res.status(500).json({ message: 'Error', error: e.message });
  }
};

const getHotelInfo = async (_req, res) => {
  try { res.json((await HotelInfo.get()) || {}); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const saveHotelInfo = async (req, res) => {
  try {
    await HotelInfo.save(req.body || {});
    res.json({ message: 'Hotel info saved' });
  } catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const getSettings = async (_req, res) => {
  try { res.json(await SystemSettings.all()); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const saveSettings = async (req, res) => {
  try {
    await SystemSettings.save(req.body || {});
    res.json({ message: 'Settings saved' });
  } catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

module.exports = { getStats, getHotelInfo, saveHotelInfo, getSettings, saveSettings };