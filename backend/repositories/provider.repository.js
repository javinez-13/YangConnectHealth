import pool from '../config/database.js';

class ProviderRepository {
  async findAll(filters = {}) {
    let query = 'SELECT * FROM providers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.specialty) {
      query += ` AND specialty = $${paramCount}`;
      params.push(filters.specialty);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR specialty ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY last_name, first_name';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT p.*, 
              f.id as facility_id, f.name as facility_name, f.address as facility_address
       FROM providers p
       LEFT JOIN provider_facilities pf ON p.id = pf.provider_id
       LEFT JOIN facilities f ON pf.facility_id = f.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findBySpecialty(specialty) {
    const result = await pool.query(
      'SELECT * FROM providers WHERE specialty = $1 ORDER BY last_name, first_name',
      [specialty]
    );
    return result.rows;
  }

  async create(providerData) {
    const { first_name, last_name, specialty, bio, photo_url, email, phone } = providerData;
    const result = await pool.query(
      `INSERT INTO providers (first_name, last_name, specialty, bio, photo_url, email, phone, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [first_name, last_name, specialty, bio, photo_url, email, phone]
    );
    return result.rows[0];
  }

  async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && key !== 'id') {
          // Handle null values for photo_url
          if (key === 'photo_url' && updates[key] === null) {
            fields.push(`${key} = NULL`);
          } else {
            fields.push(`${key} = $${paramCount}`);
            values.push(updates[key]);
            paramCount++;
          }
        }
      });

      if (fields.length === 0) return null;

      values.push(id);
      const query = `UPDATE providers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Provider repository update error:', error);
      console.error('Update data:', { id, updates });
      throw error;
    }
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM providers WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default new ProviderRepository();

