'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { Calendar, Clock, MapPin, Video, Users, Bookmark, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [filter, setFilter] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchEvents();
    fetchMyRegistrations();
  }, [filter, typeFilter]);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (filter === 'upcoming') params.upcoming = true;
      if (typeFilter) params.type = typeFilter;
      const response = await api.get('/events', { params });
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const response = await api.get('/events/my-registrations');
      setMyRegistrations(response.data.events || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      alert('Registration request submitted! Waiting for admin confirmation.');
      fetchMyRegistrations();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to register');
    }
  };

  const isRegistered = (eventId) => {
    return myRegistrations.some(reg => reg.id === eventId);
  };

  const eventTypes = {
    class: 'Class',
    screening: 'Screening',
    webinar: 'Webinar',
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Health & Wellness Events</h1>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex space-x-2">
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
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-neutral-light text-neutral-dark hover:bg-neutral'
                }`}
              >
                All Events
              </button>
            </div>
            <select
              className="input-field md:w-48"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {Object.entries(eventTypes).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {events.map((event) => {
            const registered = isRegistered(event.id);
            const reg = myRegistrations.find(r => r.id === event.id) || null;
            return (
              <div key={event.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    event.event_type === 'class' ? 'bg-blue-100 text-blue-800' :
                    event.event_type === 'screening' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {eventTypes[event.event_type] || event.event_type}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                {event.description && (
                  <p className="text-neutral-dark text-sm mb-4 line-clamp-3">{event.description}</p>
                )}

                <div className="space-y-2 mb-4 text-sm text-neutral-dark">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(event.event_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {(() => {
                      try {
                        const t = (event.event_time || '').slice(0,5);
                        const parsed = new Date(`1970-01-01T${t}:00`);
                        return isNaN(parsed) ? t : format(parsed, 'h:mm a');
                      } catch (_) { return event.event_time; }
                    })()}
                  </div>
                  {event.location ? (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  ) : event.online_link ? (
                    <div className="flex items-center">
                      <Video className="h-4 w-4 mr-2" />
                      Online Event
                    </div>
                  ) : null}
                  {event.capacity && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {event.capacity}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {registered ? (
                    <button className="btn-outline text-sm py-2 flex-1" disabled>
                      {reg?.status === 'completed' ? 'Completed' : reg?.status === 'pending' ? 'Pending Approval' : reg?.status === 'scheduled' ? 'Scheduled' : 'Registered'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="btn-primary text-sm py-2 flex-1"
                    >
                      Request Registration
                    </button>
                  )}
                  {event.online_link && (
                    <a
                      href={event.online_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm py-2 px-3"
                    >
                      <Video className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="h-16 w-16 text-neutral mx-auto mb-4" />
            <p className="text-neutral-dark">No events found</p>
          </div>
        )}

        {/* My Registrations */}
        {myRegistrations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-primary mb-6">My Registered Events</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {myRegistrations.map((event) => {
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

                const getStatusLabel = (status) => {
                  switch (status) {
                    case 'pending':
                      return 'Pending Approval';
                    case 'scheduled':
                      return 'Scheduled';
                    case 'completed':
                      return 'Completed';
                    case 'cancelled':
                      return 'Cancelled';
                    default:
                      return 'Registered';
                  }
                };

                return (
                <div key={event.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status || 'pending')}`}>
                      {getStatusLabel(event.status || 'pending')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-dark mb-3">
                    {format(new Date(event.event_date), 'MMM dd, yyyy')} at {(() => {
                      try {
                        const t = (event.event_time || '').slice(0,5);
                        const parsed = new Date(`1970-01-01T${t}:00`);
                        return isNaN(parsed) ? t : format(parsed, 'h:mm a');
                      } catch (_) { return event.event_time; }
                    })()}
                  </p>
                  {event.online_link && (
                    <a
                      href={event.online_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline text-sm py-2"
                    >
                      Join Online Event
                    </a>
                  )}
                </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

