import appointmentRepository from '../repositories/appointment.repository.js';

class AppointmentController {
  async create(req, res) {
    try {
      const { provider_id, facility_id, appointment_date, appointment_time, reason } = req.body;
      const patient_id = req.user.id;

      // Check if slot is available
      const availableSlots = await appointmentRepository.findAvailableSlots(provider_id, appointment_date);
      if (!availableSlots.includes(appointment_time)) {
        return res.status(400).json({ error: 'Selected time slot is not available' });
      }

      const appointment = await appointmentRepository.create({
        patient_id,
        provider_id,
        facility_id,
        appointment_date,
        appointment_time,
        reason,
        status: 'pending' // Requires admin confirmation
      });

      res.status(201).json({
        message: 'Appointment booked successfully',
        appointment
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req, res) {
    try {
      const patientId = req.user.id;
      const { status, upcoming } = req.query;

      const appointments = await appointmentRepository.findByPatientId(patientId, {
        status,
        upcoming: upcoming === 'true'
      });

      res.json({ appointments });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await appointmentRepository.findById(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Check if user owns this appointment
      if (appointment.patient_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ appointment });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const appointment = await appointmentRepository.findById(id);
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      if (appointment.patient_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updated = await appointmentRepository.update(id, updates);
      res.json({
        message: 'Appointment updated successfully',
        appointment: updated
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const updated = await appointmentRepository.update(id, { status: 'cancelled' });
      res.json({
        message: 'Appointment cancelled successfully',
        appointment: updated
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAvailableSlots(req, res) {
    try {
      const { provider_id, date } = req.query;
      const slots = await appointmentRepository.findAvailableSlots(provider_id, date);
      res.json({ slots });
    } catch (error) {
      console.error('Get slots error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AppointmentController();

