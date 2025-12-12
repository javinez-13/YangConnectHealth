'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Users, Calendar, Building2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../../lib/api';
import { isAuthenticated, getUser } from '../../../lib/auth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
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

  const systemStats = stats?.system || {};
  const appointmentStats = stats?.appointments || {};

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Admin Dashboard</h1>

        {/* System Health & KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary to-primary-light text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Patients</p>
                <p className="text-3xl font-bold">{systemStats.total_patients || 0}</p>
              </div>
              <Users className="h-12 w-12 text-white/50" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>{systemStats.new_users_this_week || 0} new this week</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary to-secondary-light text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Appointments Today</p>
                <p className="text-3xl font-bold">{appointmentStats.today_count || 0}</p>
              </div>
              <Calendar className="h-12 w-12 text-white/50" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span>{appointmentStats.scheduled_count || 0} scheduled</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent to-accent-hover text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Providers</p>
                <p className="text-3xl font-bold">{systemStats.total_providers || 0}</p>
              </div>
              <Users className="h-12 w-12 text-white/50" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span>Active healthcare providers</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-neutral-dark to-neutral-dark text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold">{systemStats.upcoming_events || 0}</p>
              </div>
              <Calendar className="h-12 w-12 text-white/50" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span>Classes & screenings</span>
            </div>
          </div>
        </div>

        {/* Appointment Statistics */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Appointment Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span>Completed</span>
                </div>
                <span className="font-semibold">{appointmentStats.completed_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Scheduled</span>
                </div>
                <span className="font-semibold">{appointmentStats.scheduled_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span>Cancelled</span>
                </div>
                <span className="font-semibold">{appointmentStats.cancelled_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  <span>This Week</span>
                </div>
                <span className="font-semibold">{appointmentStats.this_week_count || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-light rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  <span>This Month</span>
                </div>
                <span className="font-semibold">{appointmentStats.this_month_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/admin/users" className="block w-full btn-primary text-center">
                Manage Users
              </a>
              <a href="/admin/appointments" className="block w-full btn-outline text-center">
                View All Appointments
              </a>
              <a href="/admin/scheduling" className="block w-full btn-outline text-center">
                Manage Schedules
              </a>
              <a href="/admin/events" className="block w-full btn-outline text-center">
                Create Event
              </a>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="card">
          <h2 className="text-xl font-bold text-primary mb-4">System Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">Total Users</p>
              <p className="text-2xl font-bold">
                {(parseInt(systemStats.total_patients) || 0) + (parseInt(systemStats.total_admins) || 0)}
              </p>
            </div>
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">Facilities</p>
              <p className="text-2xl font-bold">{systemStats.total_facilities || 0}</p>
            </div>
            <div className="text-center p-4 bg-neutral-light rounded-lg">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-neutral-dark mb-1">This Week</p>
              <p className="text-2xl font-bold">{systemStats.appointments_this_week || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

