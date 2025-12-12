import pool from '../config/database.js';

class VitalsRepository {
  async create(vitalsData) {
    const { user_id, blood_pressure, heart_rate, temperature, weight, height } = vitalsData;
    const result = await pool.query(
      `INSERT INTO vitals (user_id, blood_pressure, heart_rate, temperature, weight, height, recorded_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [user_id, blood_pressure || null, heart_rate || null, temperature || null, weight || null, height || null]
    );
    return result.rows[0];
  }

  async findByUserId(userId, limit = 10) {
    const result = await pool.query(
      `SELECT * FROM vitals 
       WHERE user_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async getLatest(userId) {
    const result = await pool.query(
      `SELECT * FROM vitals 
       WHERE user_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT 1`,
      [userId]
    );
    return result.rows[0];
  }
}

export default new VitalsRepository();

