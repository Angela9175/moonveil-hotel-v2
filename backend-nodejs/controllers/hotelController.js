const HotelInfo = require('../models/HotelInfo');
const SystemSettings = require('../models/SystemSettings');

const getInfo = async (_req, res) => {
  try { res.json((await HotelInfo.get()) || {}); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

const getSettings = async (_req, res) => {
  try { res.json(await SystemSettings.all()); }
  catch (e) { res.status(500).json({ message: 'Error', error: e.message }); }
};

module.exports = { getInfo, getSettings };