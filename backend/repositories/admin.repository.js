import pool from '../config/database.js';

class AdminRepository {
  // User Management
  async getAllUsers(filters = {}) {
    let query = `
      SELECT id, email, first_name, last_name, phone, date_of_birth, role, 
             created_at, updated_at, two_factor_enabled
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.status === 'active') {
      // For now, all users are considered active. Can extend with status field later
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getUserById(id) {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, date_of_birth, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async updateUser(id, updates) {
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
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, email, first_name, last_name, phone, date_of_birth, role`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async deleteUser(id) {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  // Appointment Management
  async getAllAppointments(filters = {}) {
    let query = `
      SELECT a.*, 
             u.first_name as patient_first_name, u.last_name as patient_last_name, u.email as patient_email,
             p.first_name as provider_first_name, p.last_name as provider_last_name, p.specialty,
             f.name as facility_name, f.address as facility_address
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN providers p ON a.provider_id = p.id
      LEFT JOIN facilities f ON a.facility_id = f.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.provider_id) {
      query += ` AND a.provider_id = $${paramCount}`;
      params.push(filters.provider_id);
      paramCount++;
    }

    if (filters.facility_id) {
      query += ` AND a.facility_id = $${paramCount}`;
      params.push(filters.facility_id);
      paramCount++;
    }

    if (filters.date_from) {
      query += ` AND a.appointment_date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      query += ` AND a.appointment_date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  async getAppointmentStats() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE appointment_date = CURRENT_DATE) as today_count,
        COUNT(*) FILTER (WHERE appointment_date >= $1 AND appointment_date < CURRENT_DATE) as this_week_count,
        COUNT(*) FILTER (WHERE appointment_date >= $2) as this_month_count,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count
      FROM appointments
    `, [weekAgo, monthAgo]);

    return stats.rows[0];
  }

  // System Statistics
  async getSystemStats() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'patient') as total_patients,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM providers) as total_providers,
        (SELECT COUNT(*) FROM users WHERE created_at >= $1) as new_users_this_week,
        (SELECT COUNT(*) FROM appointments WHERE appointment_date >= $1) as appointments_this_week,
        (SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_DATE) as upcoming_events
      FROM users
      LIMIT 1
    `, [weekAgo]);

    return stats.rows[0];
  }

  // Provider Management
  async getAllProviders(filters = {}) {
    let query = 'SELECT * FROM providers WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.specialty) {
      query += ` AND specialty = $${paramCount}`;
      params.push(filters.specialty);
      paramCount++;
    }

    query += ' ORDER BY last_name, first_name';
    const result = await pool.query(query, params);
    return result.rows;
  }

  // Facility Management
  async getAllFacilities() {
    const result = await pool.query('SELECT * FROM facilities ORDER BY name');
    return result.rows;
  }
}

export default new AdminRepository();

