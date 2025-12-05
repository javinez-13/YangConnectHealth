'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/admin/AdminLayout';
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Clock } from 'lucide-react';
import api from '../../../lib/api';
import { isAuthenticated, getUser } from '../../../lib/auth';

export default function AdminFacilitiesPage() {
  const router = useRouter();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

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

    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/admin/facilities');
      setFacilities(response.data.facilities || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;
    
    try {
      await api.delete(`/admin/facilities/${id}`);
      alert('Facility deleted successfully');
      fetchFacilities();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete facility');
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
          <h1 className="text-3xl font-bold text-primary">Facility Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Facility
          </button>
        </div>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility) => (
            <div key={facility.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingFacility(facility)}
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(facility.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">{facility.name}</h3>
              
              <div className="space-y-2 text-sm text-neutral-dark">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{facility.address}</span>
                </div>
                {facility.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{facility.phone}</span>
                  </div>
                )}
                {facility.hours && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{facility.hours}</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {facilities.length === 0 && (
          <div className="card text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-neutral" />
            <p className="text-neutral-dark mb-4">No facilities found</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Add Your First Facility
            </button>
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editingFacility) && (
          <FacilityModal
            facility={editingFacility}
            onClose={() => {
              setShowCreateModal(false);
              setEditingFacility(null);
            }}
            onSuccess={() => {
              fetchFacilities();
              setShowCreateModal(false);
              setEditingFacility(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// Facility Create/Edit Modal Component
function FacilityModal({ facility, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: facility?.name || '',
    address: facility?.address || '',
    phone: facility?.phone || '',
    hours: facility?.hours || '',
    latitude: facility?.latitude || '',
    longitude: facility?.longitude || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (facility) {
        // Update facility
        await api.put(`/admin/facilities/${facility.id}`, formData);
        alert('Facility updated successfully');
      } else {
        // Create facility
        await api.post('/admin/facilities', formData);
        alert('Facility created successfully');
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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold text-primary mb-4">
          {facility ? 'Edit Facility' : 'Create Facility'}
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Facility Name</label>
            <input
              type="text"
              className="input-field"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              className="input-field"
              rows={3}
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Hours</label>
              <input
                type="text"
                className="input-field"
                placeholder="Mon-Fri: 9AM-5PM"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              />
            </div>
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
              {loading ? 'Saving...' : facility ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

