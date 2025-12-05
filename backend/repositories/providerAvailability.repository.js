import pool from '../config/database.js';

class ProviderAvailabilityRepository {
  async ensureTable() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS provider_availability (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        available_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  async findByProvider(providerId) {
    await this.ensureTable();
    const result = await pool.query(
      `SELECT * FROM provider_availability WHERE provider_id = $1 ORDER BY available_date, start_time`,
      [providerId]
    );
    return result.rows;
  }

  async create(providerId, data) {
    await this.ensureTable();
    const { available_date, start_time, end_time } = data;
    const result = await pool.query(
      `INSERT INTO provider_availability (provider_id, available_date, start_time, end_time)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [providerId, available_date, start_time, end_time]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${idx}`);
        values.push(updates[key]);
        idx++;
      }
    });
    if (fields.length === 0) return null;
    values.push(id);
    const query = `UPDATE provider_availability SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM provider_availability WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default new ProviderAvailabilityRepository();
