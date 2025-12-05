'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Calendar, Clock, User, Plus, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import api from '../../../lib/api';
import { isAuthenticated, getUser } from '../../../lib/auth';
import { useRef } from 'react';

export default function AdminSchedulingPage() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('12:00');

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

    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/admin/providers');
      setProviders(response.data.providers || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (providerId) => {
    try {
      const resp = await api.get(`/admin/providers/${providerId}/availability`);
      setAvailability(resp.data.availability || []);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setAvailability([]);
    }
  };

  const handleDeleteProvider = async (id) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      await api.delete(`/admin/providers/${id}`);
      alert('Provider deleted');
      fetchProviders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete provider');
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
          <h1 className="text-3xl font-bold text-primary">Scheduling Management</h1>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Block Time
          </button>
        </div>

        {/* Provider Selection */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Providers</h2>
            <button
              onClick={() => setShowEditProviderModal(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Provider
            </button>
          </div>
                <div className="grid md:grid-cols-4 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedProvider?.id === provider.id
                    ? 'border-primary bg-primary/10'
                    : 'border-neutral hover:border-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    <p className="font-semibold">
                      {provider.first_name} {provider.last_name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-dark mb-2">{provider.specialty}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingProvider(provider); setShowEditProviderModal(true); }}
                          className="p-1 text-primary hover:bg-primary/10 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteProvider(provider.id); }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedProvider(provider); fetchAvailability(provider.id); }}
                        className="btn-outline text-sm py-1"
                      >
                        View Availability
                      </button>
                    </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        {selectedProvider && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                Schedule for {selectedProvider.first_name} {selectedProvider.last_name}
              </h2>
              <input
                type="date"
                className="input-field"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Availability</h3>
                <button
                  onClick={() => { setEditingSlot(null); setFormDate(new Date().toISOString().split('T')[0]); setFormStart('09:00'); setFormEnd('12:00'); setShowAvailabilityModal(true); }}
                  className="btn-primary text-sm"
                >
                  Add Availability
                </button>
              </div>
              {availability.length === 0 ? (
                <div className="p-4 bg-neutral-light rounded">No availability set for this provider.</div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {availability.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-semibold">{format(parseISO(slot.available_date), 'PPP')}</div>
                        <div className="text-sm text-neutral-dark">{format(parseISO(slot.available_date + 'T' + slot.start_time), 'hh:mm a')} — {format(parseISO(slot.available_date + 'T' + slot.end_time), 'hh:mm a')}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="btn-outline text-sm"
                          onClick={() => {
                            // open modal for edit
                            setEditingSlot(slot);
                            setFormDate(slot.available_date);
                            setFormStart(slot.start_time.slice(0,5));
                            setFormEnd(slot.end_time.slice(0,5));
                            setShowAvailabilityModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-danger text-sm"
                          onClick={() => {
                            if (!confirm('Delete this availability?')) return;
                            api.delete(`/admin/providers/${selectedProvider.id}/availability/${slot.id}`)
                              .then(() => fetchAvailability(selectedProvider.id))
                              .catch((e) => alert(e.response?.data?.error || 'Failed to delete'));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Availability Modal */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">{editingSlot ? 'Edit Availability' : 'Add Availability'}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm">Date</label>
                  <input type="date" className="input-field w-full" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm">Start</label>
                    <input type="time" className="input-field w-full" value={formStart} onChange={(e) => setFormStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">End</label>
                    <input type="time" className="input-field w-full" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button className="btn-secondary" onClick={() => { setShowAvailabilityModal(false); setEditingSlot(null); }}>Cancel</button>
                  <button className="btn-primary" onClick={async () => {
                    const s = formStart + ':00';
                    const e = formEnd + ':00';
                    if (s >= e) { alert('Start time must be before end time'); return; }
                    try {
                      if (editingSlot) {
                        await api.put(`/admin/providers/${selectedProvider.id}/availability/${editingSlot.id}`, { available_date: formDate, start_time: s, end_time: e });
                      } else {
                        await api.post(`/admin/providers/${selectedProvider.id}/availability`, { available_date: formDate, start_time: s, end_time: e });
                      }
                      setShowAvailabilityModal(false);
                      setEditingSlot(null);
                      fetchAvailability(selectedProvider.id);
                    } catch (err) {
                      alert(err.response?.data?.error || 'Failed to save availability');
                    }
                  }}>Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedProvider && (
          <div className="card text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-neutral" />
            <p className="text-neutral-dark">Select a provider to view their schedule</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

