'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Calendar, Clock, User, Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import api from '../../../lib/api';
import { getMediaUrl } from '../../../lib/media';
import { isAuthenticated, getUser } from '../../../lib/auth';

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
  const [providerFormData, setProviderFormData] = useState({
    first_name: '',
    last_name: '',
    specialty: '',
    bio: '',
    email: '',
    phone: '',
    photo_url: '',
  });
  const [providerImage, setProviderImage] = useState(null);
  const [providerImagePreview, setProviderImagePreview] = useState(null);
  const providerFileInputRef = useRef(null);

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

  const handleProviderImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setProviderImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProviderImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProviderImage = () => {
    setProviderImage(null);
    setProviderImagePreview(null);
    setProviderFormData({ ...providerFormData, photo_url: '' });
    if (providerFileInputRef.current) {
      providerFileInputRef.current.value = '';
    }
  };

  const handleOpenProviderModal = (provider = null) => {
    if (provider) {
      setEditingProvider(provider);
      setProviderFormData({
        first_name: provider.first_name || '',
        last_name: provider.last_name || '',
        specialty: provider.specialty || '',
        bio: provider.bio || '',
        email: provider.email || '',
        phone: provider.phone || '',
        photo_url: provider.photo_url || '',
      });
      if (provider.photo_url) {
        setProviderImagePreview(provider.photo_url);
      } else {
        setProviderImagePreview(null);
      }
    } else {
      setEditingProvider(null);
      setProviderFormData({
        first_name: '',
        last_name: '',
        specialty: '',
        bio: '',
        email: '',
        phone: '',
        photo_url: '',
      });
      setProviderImagePreview(null);
    }
    setProviderImage(null);
    setShowEditProviderModal(true);
  };

  const handleProviderSubmit = async () => {
    try {
      const submitFormData = new FormData();
      
      // Append form fields
      submitFormData.append('first_name', providerFormData.first_name);
      submitFormData.append('last_name', providerFormData.last_name);
      submitFormData.append('specialty', providerFormData.specialty);
      submitFormData.append('bio', providerFormData.bio);
      submitFormData.append('email', providerFormData.email);
      submitFormData.append('phone', providerFormData.phone);
      
      // Handle image upload
      if (providerImage) {
        submitFormData.append('photo_url', providerImage);
      } else if (!providerImagePreview && providerFormData.photo_url === '') {
        // If image was removed, send empty string to clear it
        submitFormData.append('photo_url', '');
      }

      if (editingProvider) {
        await api.put(`/admin/providers/${editingProvider.id}`, submitFormData);
        alert('Provider updated successfully');
      } else {
        await api.post('/admin/providers', submitFormData);
        alert('Provider created successfully');
      }
      setShowEditProviderModal(false);
      setEditingProvider(null);
      setProviderImage(null);
      setProviderImagePreview(null);
      fetchProviders();
    } catch (error) {
      console.error('Provider save error:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to save provider');
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
        </div>

        {/* Provider Selection */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Providers</h2>
            <button
              onClick={() => handleOpenProviderModal()}
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
                    {provider.photo_url ? (
                      <img
                        src={getMediaUrl(provider.photo_url)}
                        alt={`${provider.first_name} ${provider.last_name}`}
                        className="h-10 w-10 rounded-full object-cover mr-2 border-2 border-primary"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-2 border-2 border-primary">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <p className="font-semibold">
                      {provider.first_name} {provider.last_name}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-neutral-dark mb-2">{provider.specialty}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenProviderModal(provider); }}
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
                  {availability.map((slot) => {
                    // Safely parse the datetime strings
                    const parseDateTime = (dateStr, timeStr) => {
                      if (!dateStr || !timeStr) return null;
                      try {
                        // Extract hours and minutes from time string (handle both "HH:mm" and "HH:mm:ss" formats)
                        const timeParts = timeStr.split(':');
                        if (timeParts.length < 2) return null;
                        
                        const hours = parseInt(timeParts[0], 10);
                        const minutes = parseInt(timeParts[1], 10);
                        
                        if (isNaN(hours) || isNaN(minutes)) return null;
                        
                        // Create a Date object using the date and time
                        const date = parseISO(dateStr);
                        date.setHours(hours, minutes, 0, 0);
                        
                        // Validate the date
                        return isNaN(date.getTime()) ? null : date;
                      } catch (e) {
                        console.error('Error parsing datetime:', { dateStr, timeStr, error: e });
                        return null;
                      }
                    };

                    const startDateTime = parseDateTime(slot.available_date, slot.start_time);
                    const endDateTime = parseDateTime(slot.available_date, slot.end_time);
                    const dateOnly = slot.available_date ? (() => {
                      try {
                        const parsed = parseISO(slot.available_date);
                        return isNaN(parsed.getTime()) ? null : parsed;
                      } catch (e) {
                        return null;
                      }
                    })() : null;

                    return (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-semibold">{dateOnly ? format(dateOnly, 'PPP') : 'Invalid date'}</div>
                        <div className="text-sm text-neutral-dark">
                          {startDateTime && endDateTime 
                            ? `${format(startDateTime, 'hh:mm a')} — ${format(endDateTime, 'hh:mm a')}`
                            : 'Invalid time'}
                        </div>
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
                    );
                  })}
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

        {/* Provider Edit/Create Modal */}
        {showEditProviderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingProvider ? 'Edit Provider' : 'Add Provider'}
              </h3>
              
              {/* Provider Image Upload */}
              <div className="flex flex-col items-center mb-6">
                <label className="label mb-4">Provider Photo</label>
                <div className="relative">
                  {providerImagePreview ? (
                    <div className="relative">
                      <img
                        src={providerImagePreview}
                        alt="Provider"
                        className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveProviderImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-neutral-light border-4 border-dashed border-neutral flex items-center justify-center">
                      <User className="h-12 w-12 text-neutral-dark" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    ref={providerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProviderImageChange}
                    className="hidden"
                    id="provider-image-upload"
                  />
                  <label
                    htmlFor="provider-image-upload"
                    className="btn-outline flex items-center cursor-pointer text-sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {providerImagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                  {providerImagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveProviderImage}
                      className="btn-outline text-red-600 hover:bg-red-50 flex items-center text-sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      className="input-field w-full"
                      required
                      value={providerFormData.first_name}
                      onChange={(e) => setProviderFormData({ ...providerFormData, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      className="input-field w-full"
                      required
                      value={providerFormData.last_name}
                      onChange={(e) => setProviderFormData({ ...providerFormData, last_name: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    required
                    value={providerFormData.specialty}
                    onChange={(e) => setProviderFormData({ ...providerFormData, specialty: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea
                    className="input-field w-full"
                    rows="3"
                    value={providerFormData.bio}
                    onChange={(e) => setProviderFormData({ ...providerFormData, bio: e.target.value })}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className="input-field w-full"
                      value={providerFormData.email}
                      onChange={(e) => setProviderFormData({ ...providerFormData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      className="input-field w-full"
                      value={providerFormData.phone}
                      onChange={(e) => setProviderFormData({ ...providerFormData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowEditProviderModal(false);
                      setEditingProvider(null);
                      setProviderImage(null);
                      setProviderImagePreview(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleProviderSubmit}
                  >
                    {editingProvider ? 'Update' : 'Create'} Provider
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

