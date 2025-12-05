import facilityRepository from '../repositories/facility.repository.js';

class FacilityController {
  async getAll(req, res) {
    try {
      const facilities = await facilityRepository.findAll();
      res.json({ facilities });
    } catch (error) {
      console.error('Get facilities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const facility = await facilityRepository.findById(id);

      if (!facility) {
        return res.status(404).json({ error: 'Facility not found' });
      }

      res.json({ facility });
    } catch (error) {
      console.error('Get facility error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getByPatient(req, res) {
    try {
      const patientId = req.user.id;
      const facilities = await facilityRepository.findByPatientId(patientId);
      res.json({ facilities });
    } catch (error) {
      console.error('Get patient facilities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new FacilityController();

