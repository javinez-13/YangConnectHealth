'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, Calendar, MapPin, Video } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../lib/api';
import { isAuthenticated, getUser } from '../../../lib/auth';

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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

    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/admin/events');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await api.delete(`/admin/events/${id}`);
      alert('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'class':
        return 'bg-blue-100 text-blue-800';
      case 'screening':
        return 'bg-green-100 text-green-800';
      case 'webinar':
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">Events & Content Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.event_type)}`}>
                  {event.event_type}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingEvent(event)}
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              {event.description && (
                <p className="text-neutral-dark text-sm mb-4 line-clamp-2">{event.description}</p>
              )}

              <div className="space-y-2 text-sm text-neutral-dark mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(event.event_date), 'MMM dd, yyyy')} at {event.event_time?.slice(0, 5)}
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
                  <div className="text-sm">
                    Capacity: {event.capacity}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-neutral" />
            <p className="text-neutral-dark mb-4">No events found</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create Your First Event
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingEvent) && (
          <EventModal
            event={editingEvent}
            onClose={() => {
              setShowCreateModal(false);
              setEditingEvent(null);
            }}
            onSuccess={() => {
              fetchEvents();
              setShowCreateModal(false);
              setEditingEvent(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Event Create/Edit Modal Component
function EventModal({ event, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    event_date: event?.event_date || '',
    event_time: event?.event_time || '10:00:00',
    event_type: event?.event_type || 'class',
    location: event?.location || '',
    online_link: event?.online_link || '',
    capacity: event?.capacity || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (event) {
        // Update event
        await api.put(`/admin/events/${event.id}`, formData);
        alert('Event updated successfully');
      } else {
        // Create event
        await api.post('/admin/events', formData);
        alert('Event created successfully');
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {event ? 'Edit Event' : 'Create Event'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              className="input-field"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input-field"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-field"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Time</label>
              <input
                type="time"
                className="input-field"
                required
                value={formData.event_time.slice(0, 5)}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value + ':00' })}
              />
            </div>
          </div>

          <div>
            <label className="label">Event Type</label>
            <select
              className="input-field"
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            >
              <option value="class">Class</option>
              <option value="screening">Screening</option>
              <option value="webinar">Webinar</option>
            </select>
          </div>

          <div>
            <label className="label">Location (leave empty if online)</label>
            <input
              type="text"
              className="input-field"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Online Link (if online event)</label>
            <input
              type="url"
              className="input-field"
              value={formData.online_link}
              onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Capacity</label>
            <input
              type="number"
              className="input-field"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || '' })}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Saving...' : event ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

