import eventRepository from '../repositories/event.repository.js';

class EventController {
  async getAll(req, res) {
    try {
      const { upcoming, type } = req.query;
      const events = await eventRepository.findAll({ upcoming, type });
      res.json({ events });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const event = await eventRepository.findById(id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ event });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async register(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const registration = await eventRepository.registerUser(id, userId);
      if (!registration) {
        return res.status(400).json({ error: 'Already registered or event not found' });
      }

      res.json({
        message: 'Successfully registered for event',
        registration
      });
    } catch (error) {
      console.error('Event registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserRegistrations(req, res) {
    try {
      const userId = req.user.id;
      const events = await eventRepository.getUserRegistrations(userId);
      res.json({ events });
    } catch (error) {
      console.error('Get user registrations error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new EventController();

