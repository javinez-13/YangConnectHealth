'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { Calendar, Clock, MapPin, User, Bell, Activity, Heart, FileText } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-dark">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="text-center text-neutral-dark">Error loading dashboard</div>
      </Layout>
    );
  }

  const { user, nextAppointment, recentAppointments, facilities, careTeam, alerts, vitals } = dashboardData;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-neutral-dark">Here&apos;s what&apos;s happening with your health</p>
          </div>
          <Link href="/profile" className="btn-outline flex items-center">
            <User className="h-5 w-5 mr-2" />
            Edit Profile
          </Link>
        </div>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
            <Bell className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Important Alerts</h3>
              {alerts.map((alert, index) => (
                <p key={index} className="text-yellow-700">{alert}</p>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Next Appointment Card */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary">Next Appointment</h2>
                <Link href="/appointments" className="text-primary hover:text-primary-light text-sm">
                  View All
                </Link>
              </div>
              {nextAppointment ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {nextAppointment.provider_first_name} {nextAppointment.provider_last_name}
                      </h3>
                      <p className="text-neutral-dark mb-2">{nextAppointment.specialty}</p>
                      <div className="flex items-center text-sm text-neutral-dark space-x-4">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {format(new Date(nextAppointment.appointment_date), 'MMM dd, yyyy')} at {nextAppointment.appointment_time?.slice(0, 5)}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {nextAppointment.facility_name}
                        </span>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link href={`/appointments/${nextAppointment.id}`} className="btn-outline text-sm py-2">
                          View Details
                        </Link>
                        <Link href={`/schedule?reschedule=${nextAppointment.id}`} className="btn-secondary text-sm py-2">
                          Reschedule
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-dark">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-neutral" />
                  <p className="mb-4">No upcoming appointments</p>
                  <Link href="/schedule" className="btn-primary">
                    Book Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="card">
              <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/schedule" className="block w-full btn-primary text-center">
                  Book Appointment
                </Link>
                <Link href="/appointments" className="block w-full btn-outline text-center">
                  View Records
                </Link>
                
              </div>
            </div>
          </div>
        </div>

        {/* Recent Appointments & Care Team */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Appointments */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Recent Appointments</h2>
            {recentAppointments && recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.slice(0, 3).map((apt) => (
                  <div key={apt.id} className="border-b border-neutral pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {apt.provider_first_name} {apt.provider_last_name}
                        </p>
                        <p className="text-sm text-neutral-dark">
                          {format(new Date(apt.appointment_date), 'MMM dd, yyyy')} • {apt.specialty}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Link href="/appointments" className="text-primary hover:text-primary-light text-sm font-medium">
                  View All Appointments →
                </Link>
              </div>
            ) : (
              <p className="text-neutral-dark text-center py-4">No recent appointments</p>
            )}
          </div>

          {/* Care Team Preview */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Your Care Team</h2>
            {careTeam && careTeam.length > 0 ? (
              <div className="space-y-4">
                {careTeam.slice(0, 3).map((provider) => (
                  <div key={provider.id} className="flex items-center space-x-3">
                    {provider.photo_url ? (
                      <img
                        src={provider.photo_url}
                        alt={`${provider.first_name} ${provider.last_name}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {provider.first_name} {provider.last_name}
                      </p>
                      <p className="text-sm text-neutral-dark">{provider.specialty}</p>
                    </div>
                  </div>
                ))}
                <Link href="/care-team" className="text-primary hover:text-primary-light text-sm font-medium">
                  View Full Team →
                </Link>
              </div>
            ) : (
              <p className="text-neutral-dark text-center py-4">No care team members yet</p>
            )}
          </div>
        </div>

        {/* Vitals Snapshot */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Health Vitals</h2>
            <Link href="/vitals" className="text-primary hover:text-primary-light text-sm">
              Add/Edit Vitals
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">Blood Pressure</p>
              <p className="text-lg font-semibold">{vitals?.blood_pressure || '--/--'}</p>
            </div>
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">Heart Rate</p>
              <p className="text-lg font-semibold">{vitals?.heart_rate ? `${vitals.heart_rate} bpm` : '-- bpm'}</p>
            </div>
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">Weight</p>
              <p className="text-lg font-semibold">{vitals?.weight ? `${vitals.weight} lbs` : '-- lbs'}</p>
            </div>
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">Temperature</p>
              <p className="text-lg font-semibold">{vitals?.temperature ? `${vitals.temperature}°F` : '--°F'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

