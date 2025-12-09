'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { Calendar, Clock, MapPin, User, X, Edit, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import Link from 'next/link';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (filter === 'upcoming') params.upcoming = true;
      if (filter === 'past') params.status = 'completed';
      const response = await api.get('/appointments', { params });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      alert('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const handleReschedule = (id) => {
    router.push(`/schedule?reschedule=${id}`);
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

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate >= today && apt.status === 'scheduled';
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return aptDate < today || apt.status === 'completed' || apt.status === 'cancelled';
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-dark">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">My Appointments</h1>
          <Link href="/schedule" className="btn-primary">
            Book New Appointment
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral-dark hover:bg-neutral'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral-dark hover:bg-neutral'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'past'
                  ? 'bg-primary text-white'
                  : 'bg-neutral-light text-neutral-dark hover:bg-neutral'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Upcoming Appointments */}
        {(filter === 'all' || filter === 'upcoming') && upcomingAppointments.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-primary mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {apt.provider_first_name} {apt.provider_last_name}
                          </h3>
                          <p className="text-primary mb-2">{apt.specialty}</p>
                          <div className="space-y-1 text-sm text-neutral-dark">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {format(new Date(apt.appointment_date), 'EEEE, MMMM dd, yyyy')} at {apt.appointment_time?.slice(0, 5)}
                            </div>
                            {apt.facility_name && (
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                {apt.facility_name}
                              </div>
                            )}
                            {apt.reason && (
                              <div className="flex items-start mt-2">
                                <FileText className="h-4 w-4 mr-2 mt-0.5" />
                                <span>{apt.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        {new Date(apt.appointment_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            Check-in Available
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleReschedule(apt.id)}
                        className="btn-outline text-sm py-2 px-4"
                      >
                        <Edit className="h-4 w-4 inline mr-1" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="btn-outline text-sm py-2 px-4 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <X className="h-4 w-4 inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Past Appointments */}
        {(filter === 'all' || filter === 'past') && pastAppointments.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Appointment History</h2>
            <div className="space-y-4">
              {pastAppointments.map((apt) => (
                <div key={apt.id} className="card">
                  <div className="flex items-start space-x-4">
                    <div className="bg-neutral-light p-3 rounded-lg">
                      {apt.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Calendar className="h-6 w-6 text-neutral-dark" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {apt.provider_first_name} {apt.provider_last_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-primary mb-2">{apt.specialty}</p>
                      <div className="space-y-1 text-sm text-neutral-dark">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {format(new Date(apt.appointment_date), 'MMM dd, yyyy')} at {apt.appointment_time?.slice(0, 5)}
                        </div>
                        {apt.facility_name && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {apt.facility_name}
                          </div>
                        )}
                        {apt.reason && (
                          <div className="flex items-start mt-2">
                            <FileText className="h-4 w-4 mr-2 mt-0.5" />
                            <span>{apt.reason}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {appointments.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="h-16 w-16 text-neutral mx-auto mb-4" />
            <p className="text-neutral-dark mb-4">No appointments found</p>
            <Link href="/schedule" className="btn-primary">
              Book Your First Appointment
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

