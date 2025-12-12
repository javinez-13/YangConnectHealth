import vitalsRepository from '../repositories/vitals.repository.js';

class VitalsController {
  async create(req, res) {
    try {
      const { blood_pressure, heart_rate, temperature, weight, height } = req.body;
      const user_id = req.user.id;

      const vital = await vitalsRepository.create({
        user_id,
        blood_pressure,
        heart_rate: heart_rate ? parseInt(heart_rate) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
      });

      res.status(201).json({
        message: 'Vitals recorded successfully',
        vital
      });
    } catch (error) {
      console.error('Create vitals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAll(req, res) {
    try {
      const userId = req.user.id;
      const vitals = await vitalsRepository.findByUserId(userId);
      res.json({ vitals });
    } catch (error) {
      console.error('Get vitals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getLatest(req, res) {
    try {
      const userId = req.user.id;
      const vital = await vitalsRepository.getLatest(userId);
      res.json({ vital: vital || null });
    } catch (error) {
      console.error('Get latest vitals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new VitalsController();

