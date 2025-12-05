import pool from '../config/database.js';

class FacilityRepository {
  async findAll() {
    const result = await pool.query('SELECT * FROM facilities ORDER BY name');
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM facilities WHERE id = $1', [id]);
    return result.rows[0];
  }

  async findByPatientId(patientId) {
    const result = await pool.query(
      `SELECT DISTINCT f.*
       FROM facilities f
       INNER JOIN appointments a ON f.id = a.facility_id
       WHERE a.patient_id = $1
       ORDER BY f.name`,
      [patientId]
    );
    return result.rows;
  }

  async create(facilityData) {
    const { name, address, phone, hours } = facilityData;
    const result = await pool.query(
      `INSERT INTO facilities (name, address, phone, hours, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [name, address, phone, hours]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE facilities SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM facilities WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default new FacilityRepository();

