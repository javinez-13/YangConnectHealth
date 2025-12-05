'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { FileText, Calendar, User, Activity } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../lib/api';
import { isAuthenticated, getUser } from '../../../lib/auth';

export default function SystemLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
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

    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Fetch recent user activities, appointments, and events as system logs
      const [usersRes, appointmentsRes, eventsRes] = await Promise.all([
        api.get('/admin/users', { params: { limit: 20 } }),
        api.get('/admin/appointments', { params: { limit: 20 } }),
        api.get('/admin/events')
      ]);

      const logs = [];
      
      // User activities
      usersRes.data.users?.forEach(user => {
        logs.push({
          id: `user-${user.id}`,
          type: 'user',
          action: 'User Created',
          description: `${user.first_name} ${user.last_name} (${user.email})`,
          timestamp: user.created_at,
          user: user
        });
      });

      // Appointment activities
      appointmentsRes.data.appointments?.forEach(apt => {
        logs.push({
          id: `apt-${apt.id}`,
          type: 'appointment',
          action: apt.status === 'pending' ? 'Appointment Requested' : `Appointment ${apt.status}`,
          description: `${apt.patient_first_name} ${apt.patient_last_name} - ${apt.provider_first_name} ${apt.provider_last_name}`,
          timestamp: apt.created_at,
          appointment: apt
        });
      });

      // Event activities
      eventsRes.data.events?.forEach(event => {
        logs.push({
          id: `event-${event.id}`,
          type: 'event',
          action: 'Event Created',
          description: event.title,
          timestamp: event.created_at,
          event: event
        });
      });

      // Sort by timestamp
      logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(logs.slice(0, 50)); // Show latest 50
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'user':
        return <User className="h-5 w-5" />;
      case 'appointment':
        return <Calendar className="h-5 w-5" />;
      case 'event':
        return <Activity className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'appointment':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
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
        <h1 className="text-3xl font-bold text-primary mb-8">System Logs</h1>

        <div className="card">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border-b border-neutral pb-4 last:border-0">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getLogColor(log.type)}`}>
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{log.action}</p>
                      <span className="text-sm text-neutral-dark">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-neutral-dark">{log.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {logs.length === 0 && (
            <div className="text-center py-12 text-neutral-dark">
              <FileText className="h-16 w-16 mx-auto mb-4 text-neutral" />
              <p>No system logs found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

