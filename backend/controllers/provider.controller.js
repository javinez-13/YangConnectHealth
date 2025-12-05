import providerRepository from '../repositories/provider.repository.js';

class ProviderController {
  async getAll(req, res) {
    try {
      const { specialty, search } = req.query;
      const providers = await providerRepository.findAll({ specialty, search });
      res.json({ providers });
    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const provider = await providerRepository.findById(id);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json({ provider });
    } catch (error) {
      console.error('Get provider error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getBySpecialty(req, res) {
    try {
      const { specialty } = req.params;
      const providers = await providerRepository.findBySpecialty(specialty);
      res.json({ providers });
    } catch (error) {
      console.error('Get providers by specialty error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ProviderController();

