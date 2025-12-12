import adminRepository from '../repositories/admin.repository.js';
import userRepository from '../repositories/user.repository.js';
import appointmentRepository from '../repositories/appointment.repository.js';
import providerRepository from '../repositories/provider.repository.js';
import facilityRepository from '../repositories/facility.repository.js';
import eventRepository from '../repositories/event.repository.js';
import providerAvailabilityRepository from '../repositories/providerAvailability.repository.js';
import bcrypt from 'bcryptjs';

class AdminController {
  // Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      const systemStats = await adminRepository.getSystemStats();
      const appointmentStats = await adminRepository.getAppointmentStats();
      
      res.json({
        system: systemStats,
        appointments: appointmentStats
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // User Management
  async getAllUsers(req, res) {
    try {
      const { role, search, status, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const users = await adminRepository.getAllUsers({
        role,
        search,
        status,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({ users });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await adminRepository.getUserById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req, res) {
    try {
      const { email, password, first_name, last_name, phone, date_of_birth, role } = req.body;

      // Check if user exists
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password || 'temp123', 10);

      // Create user
      const user = await userRepository.create({
        email,
        password_hash,
        first_name,
        last_name,
        phone,
        date_of_birth,
        role: role || 'patient'
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Don't allow updating password through this endpoint
      delete updates.password;
      delete updates.password_hash;

      const user = await adminRepository.updateUser(id, updates);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'User updated successfully',
        user
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const deleted = await adminRepository.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Appointment Management
  async getAllAppointments(req, res) {
    try {
      const { status, provider_id, facility_id, date_from, date_to, page = 1, limit = 50 } = req.query;
      const offset = (page - 1) * limit;

      const appointments = await adminRepository.getAllAppointments({
        status,
        provider_id,
        facility_id,
        date_from,
        date_to,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({ appointments });
    } catch (error) {
      console.error('Get all appointments error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updates = {};
      if (status) updates.status = status;
      if (notes) updates.notes = notes;

      const appointment = await appointmentRepository.update(id, updates);

      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      res.json({
        message: 'Appointment updated successfully',
        appointment
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Provider Management
  async getAllProviders(req, res) {
    try {
      const { specialty } = req.query;
      const providers = await adminRepository.getAllProviders({ specialty });
      res.json({ providers });
    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createProvider(req, res) {
    try {
      const providerData = { ...req.body };
      
      // Handle file upload
      if (req.file) {
        providerData.photo_url = `/uploads/provider-photos/${req.file.filename}`;
      }
      
      const provider = await providerRepository.create(providerData);
      res.status(201).json({
        message: 'Provider created successfully',
        provider
      });
    } catch (error) {
      console.error('Create provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProvider(req, res) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      const provider = await providerRepository.findById(id);
      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      // Handle file upload
      if (req.file) {
        updates.photo_url = `/uploads/provider-photos/${req.file.filename}`;
      } else if (updates.photo_url === '') {
        // Handle empty photo_url to remove image
        updates.photo_url = null;
      }

      const updated = await providerRepository.update(id, updates);
      if (!updated) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      res.json({
        message: 'Provider updated successfully',
        provider: updated
      });
    } catch (error) {
      console.error('Update provider error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        stack: error.stack
      });
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message || 'Failed to update provider'
      });
    }
  }

  // Facility Management
  async getAllFacilities(req, res) {
    try {
      const facilities = await adminRepository.getAllFacilities();
      res.json({ facilities });
    } catch (error) {
      console.error('Get facilities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createFacility(req, res) {
    try {
      const { name, address, phone, hours } = req.body;
      const result = await facilityRepository.create({
        name,
        address,
        phone,
        hours
      });
      res.status(201).json({
        message: 'Facility created successfully',
        facility: result
      });
    } catch (error) {
      console.error('Create facility error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteFacility(req, res) {
    try {
      const { id } = req.params;

      const existing = await facilityRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      const deleted = await facilityRepository.delete(id);
      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete facility' });
      }

      res.json({ message: 'Facility deleted successfully', id: deleted.id });
    } catch (error) {
      console.error('Delete facility error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Event Management
  async getAllEvents(req, res) {
    try {
      const { upcoming, type } = req.query;
      const events = await eventRepository.findAll({ upcoming, type });
      res.json({ events });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createEvent(req, res) {
    try {
      const event = await eventRepository.create(req.body);
      res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const event = await eventRepository.findById(id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      const updated = await eventRepository.update(id, updates);
      if (!updated) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      res.json({
        message: 'Event updated successfully',
        event: updated
      });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      const deleted = await eventRepository.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully', id: deleted.id });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteProvider(req, res) {
    try {
      const { id } = req.params;
      const existing = await providerRepository.findById(id);
      if (!existing) return res.status(404).json({ error: 'Provider not found' });
      const deleted = await providerRepository.delete(id);
      if (!deleted) return res.status(500).json({ error: 'Failed to delete provider' });
      res.json({ message: 'Provider deleted successfully', id: deleted.id });
    } catch (error) {
      console.error('Delete provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEventRegistrations(req, res) {
    try {
      const { id } = req.params;
      const registrations = await eventRepository.getRegistrationsByEvent(id);
      res.json({ registrations });
    } catch (error) {
      console.error('Get event registrations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Provider availability CRUD
  async getProviderAvailability(req, res) {
    try {
      const { id } = req.params; // provider id
      const avail = await providerAvailabilityRepository.findByProvider(id);
      res.json({ availability: avail });
    } catch (error) {
      console.error('Get provider availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createProviderAvailability(req, res) {
    try {
      const { id } = req.params; // provider id
      const payload = req.body;
      const created = await providerAvailabilityRepository.create(id, payload);
      res.status(201).json({ message: 'Availability created', availability: created });
    } catch (error) {
      console.error('Create provider availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProviderAvailability(req, res) {
    try {
      const { availabilityId } = req.params;
      const updates = req.body;
      const updated = await providerAvailabilityRepository.update(availabilityId, updates);
      if (!updated) return res.status(404).json({ error: 'Availability not found or no fields to update' });
      res.json({ message: 'Availability updated', availability: updated });
    } catch (error) {
      console.error('Update provider availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteProviderAvailability(req, res) {
    try {
      const { availabilityId } = req.params;
      const deleted = await providerAvailabilityRepository.delete(availabilityId);
      if (!deleted) return res.status(404).json({ error: 'Availability not found' });
      res.json({ message: 'Availability deleted', id: deleted.id });
    } catch (error) {
      console.error('Delete provider availability error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateEventRegistrationStatus(req, res) {
    try {
      const { eventId, userId } = req.params;
      const { status } = req.body;

      const registration = await eventRepository.updateRegistrationStatus(eventId, userId, status);
      if (!registration) {
        return res.status(404).json({ error: 'Registration not found' });
      }

      res.json({
        message: 'Registration status updated successfully',
        registration
      });
    } catch (error) {
      console.error('Update registration status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AdminController();

