'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import MapPicker from '@/components/MapPicker';

interface CenterFormData {
  name: string;
  address: string;
  city: string;
  province: string;
  barangay: string;
  capacity: number;
  contact_number: string;
  contact_person: string;
  facilities: string;
  latitude: number;
  longitude: number;
}

export default function EditEvacuationCenterPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CenterFormData>({
    name: '',
    address: '',
    city: '',
    province: '',
    barangay: '',
    capacity: 0,
    contact_number: '',
    contact_person: '',
    facilities: '',
    latitude: 13.41,
    longitude: 122.56,
  });

  useEffect(() => {
    fetchCenter();
  }, [centerId]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const response = await centersApi.getById(Number(centerId));
      
      if (response.status === 'success' && response.data) {
        const center = response.data;
        
        // Convert facilities array to comma-separated string
        const facilitiesStr = Array.isArray(center.facilities)
          ? center.facilities.join(', ')
          : center.facilities || '';
        
        setFormData({
          name: center.name || '',
          address: center.address || '',
          city: center.city || '',
          province: center.province || '',
          barangay: center.barangay || '',
          capacity: center.capacity || 0,
          contact_number: center.contact_number || '',
          contact_person: center.contact_person || '',
          facilities: facilitiesStr,
          latitude: Number(center.latitude) || 13.41,
          longitude: Number(center.longitude) || 122.56,
        });
      }
    } catch (err) {
      console.error('Error fetching center:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address || !formData.city || !formData.province) {
      setError('Name, address, city, and province are required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Parse facilities from comma-separated string to array
      const facilitiesArray = formData.facilities
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const updateData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        barangay: formData.barangay || undefined,
        capacity: formData.capacity,
        contact_number: formData.contact_number || undefined,
        contact_person: formData.contact_person || undefined,
        facilities: facilitiesArray,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      console.log('📤 Updating center with data:', updateData);
      await centersApi.update(Number(centerId), updateData);
      
      router.push('/evacuation-centers');
    } catch (err) {
      console.error('Error updating center:', err);
      setError(handleApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('📍 Location selected:', { lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Evacuation Center</h1>
        <p className="text-gray-600 mt-1">Update evacuation center information</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Center Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province *
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barangay
              </label>
              <input
                type="text"
                value={formData.barangay}
                onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="text"
                value={formData.contact_number}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="09XXXXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facilities
            </label>
            <textarea
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Comma-separated: Medical supplies, Food storage, Sleeping quarters"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple facilities with commas</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
          <MapPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            radius={5}
            onLocationChange={handleLocationSelect}
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.000001"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Updating...' : 'Update Center'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/evacuation-centers')}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
