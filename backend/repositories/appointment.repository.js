import pool from '../config/database.js';

class AppointmentRepository {
  async create(appointmentData) {
    const { patient_id, provider_id, facility_id, appointment_date, appointment_time, reason, status } = appointmentData;
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, provider_id, facility_id, appointment_date, appointment_time, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [patient_id, provider_id, facility_id, appointment_date, appointment_time, reason, status || 'scheduled']
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await pool.query(
      `SELECT a.*, 
              u.first_name as patient_first_name, u.last_name as patient_last_name,
              p.first_name as provider_first_name, p.last_name as provider_last_name, p.specialty,
              f.name as facility_name, f.address, f.phone as facility_phone
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       LEFT JOIN providers p ON a.provider_id = p.id
       LEFT JOIN facilities f ON a.facility_id = f.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async findByPatientId(patientId, filters = {}) {
    let query = `SELECT a.*, 
                        p.first_name as provider_first_name, p.last_name as provider_last_name, p.specialty, p.photo_url,
                        f.name as facility_name, f.address, f.phone as facility_phone
                 FROM appointments a
                 LEFT JOIN providers p ON a.provider_id = p.id
                 LEFT JOIN facilities f ON a.facility_id = f.id
                 WHERE a.patient_id = $1`;
    const params = [patientId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.upcoming) {
      query += ` AND a.appointment_date >= CURRENT_DATE`;
    }

    query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findByProviderId(providerId, date) {
    const result = await pool.query(
      `SELECT a.*, 
              u.first_name as patient_first_name, u.last_name as patient_last_name
       FROM appointments a
       LEFT JOIN users u ON a.patient_id = u.id
       WHERE a.provider_id = $1 AND a.appointment_date = $2 AND a.status = 'scheduled'
       ORDER BY a.appointment_time`,
      [providerId, date]
    );
    return result.rows;
  }

  async findAvailableSlots(providerId, date) {
    const provider = await pool.query('SELECT * FROM providers WHERE id = $1', [providerId]);
    if (!provider.rows[0]) return [];

    const existingAppointments = await this.findByProviderId(providerId, date);
    const bookedTimes = existingAppointments.map(apt => apt.appointment_time);

    // Generate available time slots (9 AM to 5 PM, 30-minute intervals)
    const slots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        if (!bookedTimes.includes(timeStr)) {
          slots.push(timeStr);
        }
      }
    }

    return slots;
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
    const query = `UPDATE appointments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async delete(id) {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default new AppointmentRepository();

