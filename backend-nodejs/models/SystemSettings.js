const { pool } = require('../config/db');

const SystemSettings = {
  async all() {
    const [rows] = await pool.query('SELECT `key`,`value` FROM system_settings');
    const obj = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    return obj;
  },
  async save(obj) {
    for (const [k, v] of Object.entries(obj || {})) {
      await pool.query(
        'INSERT INTO system_settings (`key`,`value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=VALUES(`value`)',
        [k, String(v)]);
    }
  },
};

module.exports = SystemSettings;