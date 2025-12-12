'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { Activity, Heart, Save } from 'lucide-react';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

export default function VitalsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
  });
  const [recentVitals, setRecentVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      const response = await api.get('/vitals');
      if (response.data.vitals && response.data.vitals.length > 0) {
        const latest = response.data.vitals[0];
        setFormData({
          blood_pressure: latest.blood_pressure || '',
          heart_rate: latest.heart_rate || '',
          temperature: latest.temperature || '',
          weight: latest.weight || '',
          height: latest.height || '',
        });
        setRecentVitals(response.data.vitals.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.post('/vitals', formData);
      setSuccess('Vitals recorded successfully!');
      fetchVitals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record vitals');
    } finally {
      setSaving(false);
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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Health Vitals</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Record Vitals</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Blood Pressure (e.g., 120/80)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="120/80"
                  value={formData.blood_pressure}
                  onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Heart Rate (bpm)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="72"
                  value={formData.heart_rate}
                  onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="98.6"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="150"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Height (inches)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="70"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Vitals'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-primary mb-4">Recent Records</h2>
            {recentVitals.length > 0 ? (
              <div className="space-y-4">
                {recentVitals.map((vital) => (
                  <div key={vital.id} className="border-b border-neutral pb-3 last:border-0">
                    <p className="text-sm text-neutral-dark mb-2">
                      {new Date(vital.recorded_at).toLocaleDateString()} at {new Date(vital.recorded_at).toLocaleTimeString()}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {vital.blood_pressure && (
                        <div>
                          <span className="text-neutral-dark">BP: </span>
                          <span className="font-semibold">{vital.blood_pressure}</span>
                        </div>
                      )}
                      {vital.heart_rate && (
                        <div>
                          <span className="text-neutral-dark">HR: </span>
                          <span className="font-semibold">{vital.heart_rate} bpm</span>
                        </div>
                      )}
                      {vital.temperature && (
                        <div>
                          <span className="text-neutral-dark">Temp: </span>
                          <span className="font-semibold">{vital.temperature}°F</span>
                        </div>
                      )}
                      {vital.weight && (
                        <div>
                          <span className="text-neutral-dark">Weight: </span>
                          <span className="font-semibold">{vital.weight} lbs</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-dark text-center py-8">No vitals recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

