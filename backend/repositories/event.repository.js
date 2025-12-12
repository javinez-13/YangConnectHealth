import pool from '../config/database.js';

class EventRepository {
  async findAll(filters = {}) {
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.upcoming) {
      query += ` AND event_date >= CURRENT_DATE`;
    }

    if (filters.type) {
      query += ` AND event_type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    query += ' ORDER BY event_date, event_time';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0];
  }

  async create(eventData) {
    const { title, description, event_date, event_time, event_type, location, online_link, capacity } = eventData;
    const result = await pool.query(
      `INSERT INTO events (title, description, event_date, event_time, event_type, location, online_link, capacity, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [title, description, event_date, event_time, event_type, location, online_link, capacity]
    );
    return result.rows[0];
  }

  async registerUser(eventId, userId) {
    const result = await pool.query(
      `INSERT INTO event_registrations (event_id, user_id, status, registered_at)
       VALUES ($1, $2, 'pending', NOW())
       ON CONFLICT (event_id, user_id) DO NOTHING
       RETURNING *`,
      [eventId, userId]
    );
    return result.rows[0];
  }

  async updateRegistrationStatus(eventId, userId, status) {
    const result = await pool.query(
      `UPDATE event_registrations 
       SET status = $1 
       WHERE event_id = $2 AND user_id = $3
       RETURNING *`,
      [status, eventId, userId]
    );
    return result.rows[0];
  }

  async getRegistrationsByEvent(eventId) {
    const result = await pool.query(
      `SELECT er.*, 
              u.first_name, u.last_name, u.email, u.phone
       FROM event_registrations er
       LEFT JOIN users u ON er.user_id = u.id
       WHERE er.event_id = $1
       ORDER BY er.registered_at DESC`,
      [eventId]
    );
    return result.rows;
  }

  async getUserRegistrations(userId) {
    const result = await pool.query(
      `SELECT e.*, er.registered_at, er.status
       FROM events e
       INNER JOIN event_registrations er ON e.id = er.event_id
       WHERE er.user_id = $1
       ORDER BY e.event_date, e.event_time`,
      [userId]
    );
    return result.rows;
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
    const query = `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default new EventRepository();

