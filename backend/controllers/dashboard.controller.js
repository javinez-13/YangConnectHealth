import appointmentRepository from '../repositories/appointment.repository.js';
import facilityRepository from '../repositories/facility.repository.js';
import providerRepository from '../repositories/provider.repository.js';
import userRepository from '../repositories/user.repository.js';
import vitalsRepository from '../repositories/vitals.repository.js';

class DashboardController {
  async getDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Get user info
      const user = await userRepository.findById(userId);

      // Get next pending or scheduled appointment
      let allUpcomingAppointments = await appointmentRepository.findByPatientId(userId, { upcoming: true });
      const nextAppointment = allUpcomingAppointments.find(apt => apt.status === 'pending' || apt.status === 'scheduled') || null;

      // Get recent appointments (last 5)
      const recentAppointments = await appointmentRepository.findByPatientId(userId);
      const recent = recentAppointments.slice(0, 5);

      // Get user's facilities
      const facilities = await facilityRepository.findByPatientId(userId);

      // Get care team (providers from appointments)
      const careTeamProviders = [];
      const providerIds = [...new Set(recentAppointments.map(apt => apt.provider_id).filter(Boolean))];
      for (const providerId of providerIds) {
        const provider = await providerRepository.findById(providerId);
        if (provider) {
          careTeamProviders.push(provider);
        }
      }

      // Get latest vitals
      const latestVitals = await vitalsRepository.getLatest(userId);

      res.json({
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        },
        nextAppointment,
        recentAppointments: recent,
        facilities,
        careTeam: careTeamProviders,
        vitals: latestVitals,
        alerts: [] // Can be extended with actual alert logic
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new DashboardController();

