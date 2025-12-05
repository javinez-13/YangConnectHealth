import pool from '../config/database.js';

class UserRepository {
  async create(userData) {
    const { email, password_hash, first_name, last_name, phone, date_of_birth, role } = userData;
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, role, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, email, first_name, last_name, phone, date_of_birth, role, created_at`,
      [email, password_hash, first_name, last_name, phone, date_of_birth, role || 'patient']
    );
    return result.rows[0];
  }

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, date_of_birth, role, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, phone, date_of_birth, role`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateTwoFactorSecret(userId, secret) {
    const result = await pool.query(
      'UPDATE users SET two_factor_secret = $1, two_factor_enabled = true WHERE id = $2 RETURNING id',
      [secret, userId]
    );
    return result.rows[0];
  }

  async disableTwoFactor(userId) {
    const result = await pool.query(
      'UPDATE users SET two_factor_secret = NULL, two_factor_enabled = false WHERE id = $1 RETURNING id',
      [userId]
    );
    return result.rows[0];
  }
}

export default new UserRepository();

