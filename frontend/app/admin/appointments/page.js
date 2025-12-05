'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Search, Filter, Calendar, User, MapPin, Edit, Users } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../lib/api';
import { isAuthenticated, getUser } from '../../../lib/auth';

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'events'
  const [filters, setFilters] = useState({
    status: '',
    provider_id: '',
    facility_id: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const user = getUser();
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchAppointments();
    fetchEventRegistrations();
  }, [filters]);

  const fetchAppointments = async () => {
    try {
      const params = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) params[key] = filters[key];
      });

      const response = await api.get('/admin/appointments', { params });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventRegistrations = async () => {
    try {
      const response = await api.get('/admin/events');
      const events = response.data.events || [];
      // Fetch registrations for each event
      const registrations = [];
      for (const event of events) {
        try {
          const regResponse = await api.get(`/admin/events/${event.id}/registrations`);
          regResponse.data.registrations?.forEach(reg => {
            registrations.push({ ...reg, event_title: event.title, event_id: event.id });
          });
        } catch (err) {
          // Event might not have registrations endpoint yet
          console.error(`Error fetching registrations for event ${event.id}:`, err);
        }
      }
      setEventRegistrations(registrations);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}`, { status });
      alert('Appointment status updated');
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update appointment');
    }
  };

  const handleEventRegistrationStatus = async (eventId, userId, status) => {
    try {
      await api.put(`/admin/events/${eventId}/registrations/${userId}`, { status });
      alert('Event registration status updated');
      fetchEventRegistrations();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update registration');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-dark">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Appointment & Event Management</h1>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'appointments'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral-dark hover:bg-neutral'
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral-dark hover:bg-neutral'
              }`}
            >
              Event Registrations
            </button>
          </div>
        </div>

        {/* Filters - Only show for appointments */}
        {activeTab === 'appointments' && (
          <div className="card mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <select
                className="input-field"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                type="date"
                className="input-field"
                placeholder="From Date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
              <input
                type="date"
                className="input-field"
                placeholder="To Date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
              <button
                onClick={() => setFilters({ status: '', provider_id: '', facility_id: '', date_from: '', date_to: '' })}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        {activeTab === 'appointments' && (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Provider</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Date & Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Facility</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Status</th>
                  {/* Actions column removed per request */}
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-neutral hover:bg-neutral-light">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold">
                          {apt.patient_first_name} {apt.patient_last_name}
                        </p>
                        <p className="text-sm text-neutral-dark">{apt.patient_email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold">
                          {apt.provider_first_name} {apt.provider_last_name}
                        </p>
                        <p className="text-sm text-neutral-dark">{apt.specialty}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-neutral-dark" />
                        <div>
                          <p>{format(new Date(apt.appointment_date), 'MMM dd, yyyy')}</p>
                          <p className="text-neutral-dark">{(() => {
                            try {
                              const t = (apt.appointment_time || '').slice(0,5);
                              const parsed = new Date(`1970-01-01T${t}:00`);
                              return isNaN(parsed) ? t : format(parsed, 'h:mm a');
                            } catch (_) { return apt.appointment_time; }
                          })()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-neutral-dark" />
                        <span>{apt.facility_name || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusUpdate(apt.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(apt.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    {/* Actions removed */}
                  </tr>
                ))}
              </tbody>
            </table>

            {appointments.length === 0 && (
              <div className="text-center py-12 text-neutral-dark">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-neutral" />
                <p>No appointments found</p>
              </div>
            )}
          </div>
        )}

        {/* Event Registrations Table */}
        {activeTab === 'events' && (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Event</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Patient</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-dark">Status</th>
                  {/* Actions column removed for event registrations */}
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((reg) => (
                  <tr key={`${reg.event_id}-${reg.user_id}`} className="border-b border-neutral hover:bg-neutral-light">
                    <td className="py-3 px-4">
                      <p className="font-semibold">{reg.event_title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p>{reg.first_name} {reg.last_name}</p>
                      <p className="text-sm text-neutral-dark">{reg.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={reg.status || 'pending'}
                        onChange={(e) => handleEventRegistrationStatus(reg.event_id, reg.user_id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border-0 ${getStatusColor(reg.status || 'pending')}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    {/* Actions removed */}
                  </tr>
                ))}
              </tbody>
            </table>
            {eventRegistrations.length === 0 && (
              <div className="text-center py-12 text-neutral-dark">
                <Users className="h-16 w-16 mx-auto mb-4 text-neutral" />
                <p>No event registrations found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

