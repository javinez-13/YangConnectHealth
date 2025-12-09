'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import { User, Mail, Phone, MapPin, MessageSquare, Calendar } from 'lucide-react';
import api from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import Link from 'next/link';

export default function CareTeamPage() {
  const router = useRouter();
  const [careTeam, setCareTeam] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [providerSchedule, setProviderSchedule] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchCareTeam();
    fetchFacilities();
  }, []);

  const fetchCareTeam = async () => {
    try {
      const dashboardResponse = await api.get('/dashboard');
      const providers = dashboardResponse.data.careTeam || [];
      
      // Also fetch all providers for potential selection
      const providersResponse = await api.get('/providers');
      const allProviders = providersResponse.data.providers || [];
      
      // Combine and deduplicate
      const providerMap = new Map();
      [...providers, ...allProviders].forEach(p => {
        if (!providerMap.has(p.id)) {
          providerMap.set(p.id, p);
        }
      });
      
      setCareTeam(Array.from(providerMap.values()));
    } catch (error) {
      console.error('Error fetching care team:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.get('/facilities/patient');
      setFacilities(response.data.facilities || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleMessageProvider = (provider) => {
    setSelectedProvider(provider);
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    // In a real app, this would send to a messaging system
    alert(`Message sent to ${selectedProvider.first_name} ${selectedProvider.last_name}`);
    setShowMessageModal(false);
    setMessageText('');
    setSelectedProvider(null);
  };

  const handleViewSchedule = async (provider) => {
    setSelectedProvider(provider);
    try {
      // Fetch provider's appointments
      const response = await api.get('/appointments', {
        params: { provider_id: provider.id }
      });
      setProviderSchedule(response.data.appointments || []);
      setShowScheduleModal(true);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      alert('Failed to load schedule');
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">My Care Team</h1>

        {/* Primary Care Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">My Primary Care Team</h2>
          {careTeam.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careTeam.map((provider) => (
                <div key={provider.id} className="card">
                  <div className="flex items-start space-x-4 mb-4">
                    {provider.photo_url ? (
                      <img
                        src={provider.photo_url}
                        alt={`${provider.first_name} ${provider.last_name}`}
                        className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-primary"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {provider.first_name} {provider.last_name}
                      </h3>
                      <p className="text-primary font-medium mb-2">{provider.specialty}</p>
                      {provider.email && (
                        <p className="text-sm text-neutral-dark flex items-center mb-1">
                          <Mail className="h-4 w-4 mr-2" />
                          {provider.email}
                        </p>
                      )}
                      {provider.phone && (
                        <p className="text-sm text-neutral-dark flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          {provider.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {provider.bio && (
                    <p className="text-sm text-neutral-dark mb-4">{provider.bio}</p>
                  )}
                  {/* Messaging and schedule actions removed per UX update */}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <User className="h-16 w-16 text-neutral mx-auto mb-4" />
              <p className="text-neutral-dark mb-4">You don&apos;t have any care team members yet.</p>
              <Link href="/schedule" className="btn-primary">
                Book Your First Appointment
              </Link>
            </div>
          )}
        </section>

        {/* My Facilities */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-primary mb-6">My Facilities</h2>
          {facilities.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {facilities.map((facility) => (
                <div key={facility.id} className="card">
                  <h3 className="font-semibold text-lg mb-3">{facility.name}</h3>
                  <div className="space-y-2 text-neutral-dark">
                    <p className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      {facility.address}
                    </p>
                    {facility.phone && (
                      <p className="flex items-center">
                        <Phone className="h-5 w-5 mr-2" />
                        {facility.phone}
                      </p>
                    )}
                    {facility.hours && (
                      <p className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {facility.hours}
                      </p>
                    )}
                  </div>
                  {facility.latitude && facility.longitude && (
                    <div className="mt-4">
                      <a
                        href={`https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm py-2 inline-block"
                      >
                        Get Directions
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8">
              <MapPin className="h-12 w-12 text-neutral mx-auto mb-4" />
              <p className="text-neutral-dark">No facilities found</p>
            </div>
          )}
        </section>


      </div>
    </Layout>
  );
}

