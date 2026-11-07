const { pool } = require('../config/db');

const PasswordReset = {
  async create({ userId, tokenHash, expiresAt }) {
    const [r] = await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?,?,?)',
      [userId, tokenHash, expiresAt]);
    return { id: r.insertId };
  },
  async findValid(tokenHash) {
    const [rows] = await pool.query(
      `SELECT * FROM password_resets
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`, [tokenHash]);
    return rows[0] || null;
  },
  async markUsed(id) {
    await pool.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [id]);
  },
};

module.exports = PasswordReset;