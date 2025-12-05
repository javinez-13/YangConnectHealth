'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import Layout from '../../components/Layout';
import { Calendar as CalendarIcon, Clock, User, MapPin, Check } from 'lucide-react';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

function ScheduleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Provider, 2: Select Date/Time, 3: Confirm

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchProviders();
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedProvider, selectedDate]);

  const fetchProviders = async () => {
    try {
      const response = await api.get('/providers');
      setProviders(response.data.providers || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities');
      setFacilities(response.data.facilities || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedProvider || !selectedDate) return;
    try {
      const response = await api.get('/appointments/slots', {
        params: { provider_id: selectedProvider.id, date: selectedDate },
      });
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setStep(2);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBooking = async () => {
    if (!selectedProvider || !selectedFacility || !selectedDate || !selectedTime || !reason) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/appointments', {
        provider_id: selectedProvider.id,
        facility_id: selectedFacility.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason,
      });
      alert('Appointment request submitted! Waiting for admin confirmation.');
      router.push('/appointments');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Schedule Appointment</h1>

        {/* Step Indicator */}
        <div className="mb-8 flex items-center justify-center space-x-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-primary text-white' : 'bg-neutral text-neutral-dark'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > s ? 'bg-primary' : 'bg-neutral'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Provider */}
        {step === 1 && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProviderSelect(provider)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {provider.first_name} {provider.last_name}
                      </h3>
                      <p className="text-primary mb-2">{provider.specialty}</p>
                      {provider.bio && (
                        <p className="text-sm text-neutral-dark line-clamp-2">{provider.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Date/Time */}
        {step === 2 && selectedProvider && (
          <div>
            <div className="card mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-primary hover:text-primary-light"
                >
                  ← Back
                </button>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedProvider.first_name} {selectedProvider.last_name}
                  </h2>
                  <p className="text-neutral-dark">{selectedProvider.specialty}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  Select Date
                </h3>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                />
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Available Times
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => {
                        const timeStr = (typeof slot === 'string' ? slot.slice(0,5) : String(slot)).padEnd(5, '0');
                        const parsed = new Date(`1970-01-01T${timeStr}:00`);
                        const label = isNaN(parsed) ? timeStr : format(parsed, 'h:mm a');
                        return (
                          <button
                            key={slot}
                            onClick={() => handleTimeSelect(slot)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              selectedTime === slot
                                ? 'border-primary bg-primary text-white'
                                : 'border-neutral hover:border-primary'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })
                    ) : (
                      <p className="col-span-3 text-neutral-dark text-center py-4">
                        No available slots for this date
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div>
            <div className="card mb-6">
              <button
                onClick={() => setStep(2)}
                className="text-primary hover:text-primary-light mb-4"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold mb-6">Confirm Appointment</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-neutral-dark mb-1">Provider</p>
                  <p className="font-semibold">
                    {selectedProvider.first_name} {selectedProvider.last_name} - {selectedProvider.specialty}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-dark mb-1">Date & Time</p>
                  <p className="font-semibold">
                    {new Date(selectedDate).toLocaleDateString()} at {(() => {
                      try {
                        const t = (selectedTime || '').slice(0,5);
                        const parsed = new Date(`1970-01-01T${t}:00`);
                        return isNaN(parsed) ? t : format(parsed, 'h:mm a');
                      } catch (_) { return selectedTime; }
                    })()}
                  </p>
                </div>
                <div>
                  <label className="label">Select Facility</label>
                  <select
                    className="input-field"
                    value={selectedFacility?.id || ''}
                    onChange={(e) => {
                      const facility = facilities.find(f => f.id === parseInt(e.target.value));
                      setSelectedFacility(facility);
                    }}
                  >
                    <option value="">Select a facility</option>
                    {facilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} - {facility.address}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Reason for Visit</label>
                  <textarea
                    className="input-field"
                    rows={4}
                    placeholder="Please describe the reason for your visit..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={loading || !selectedFacility || !reason}
                className="w-full btn-primary py-3 text-lg"
              >
                {loading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ScheduleContent />
    </Suspense>
  );
}

