'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import MapPicker from '@/components/MapPicker';
import toast from 'react-hot-toast';

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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [autoGeocodeEnabled, setAutoGeocodeEnabled] = useState(true);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
    
    // Reverse geocode to get address from coordinates
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) return;

      console.log('🔄 Reverse geocoding coordinates:', { lat, lng });

      // Use Mapbox Reverse Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&country=PH&types=address,place,locality,neighborhood`
      );

      if (!response.ok) {
        console.error('Reverse geocoding failed');
        return;
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        console.log('✅ Reverse geocoded:', data.features[0]);
        
        // Extract address components from the response
        const feature = data.features[0];
        const context = feature.context || [];
        
        // Get place name (could be street, neighborhood, or place)
        let address = feature.text || '';
        let barangay = '';
        let city = '';
        let province = '';

        // Parse context for city and province
        context.forEach((item: any) => {
          if (item.id.startsWith('place.')) {
            city = item.text;
          } else if (item.id.startsWith('region.')) {
            province = item.text;
          } else if (item.id.startsWith('locality.') || item.id.startsWith('neighborhood.')) {
            barangay = item.text;
          }
        });

        // If we got a place name as the main feature, use it as city
        if (feature.place_type?.includes('place')) {
          city = feature.text;
        }

        // Temporarily disable auto-geocoding to prevent loop
        const wasAutoEnabled = autoGeocodeEnabled;
        if (wasAutoEnabled) {
          setAutoGeocodeEnabled(false);
        }

        // Update form with reverse geocoded address
        setFormData(prev => ({
          ...prev,
          address: address || prev.address,
          city: city || prev.city,
          province: province || prev.province,
          barangay: barangay || prev.barangay,
        }));

        console.log('📝 Updated address fields:', { address, city, province, barangay });
        toast.success('Address updated from map location');

        // Re-enable auto-geocoding after a delay
        if (wasAutoEnabled) {
          setTimeout(() => {
            setAutoGeocodeEnabled(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
      // Silent fail - coordinates are still updated
    }
  };

  const geocodeAddress = async () => {
    // Build the full address string
    const addressParts = [
      formData.barangay,
      formData.address,
      formData.city,
      formData.province,
      'Philippines'
    ].filter(Boolean);

    if (addressParts.length < 3) {
      // Don't show error for auto-geocoding, only for manual
      if (!autoGeocodeEnabled) {
        toast.error('Please fill in at least the address, city, and province fields');
      }
      return;
    }

    const fullAddress = addressParts.join(', ');
    
    try {
      setIsGeocoding(true);
      console.log('🔍 Geocoding address:', fullAddress);

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        toast.error('Mapbox token not configured');
        return;
      }

      // Use Mapbox Geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxToken}&country=PH&limit=1`
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const placeName = data.features[0].place_name;

        console.log('✅ Geocoded successfully:', { latitude, longitude, placeName });

        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Only show success toast for manual geocoding
        if (!autoGeocodeEnabled) {
          toast.success(`Location found: ${placeName}`);
        }
      } else {
        // Only show error for manual geocoding
        if (!autoGeocodeEnabled) {
          toast.error('Location not found. Please try a different address or set the location manually on the map.');
        }
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      // Only show error for manual geocoding
      if (!autoGeocodeEnabled) {
        toast.error('Failed to geocode address. Please set the location manually on the map.');
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocode when address fields change (with debounce)
  useEffect(() => {
    if (!autoGeocodeEnabled || loading) return;

    // Clear existing timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // Check if we have minimum required fields
    const hasMinimumFields = formData.address && formData.city && formData.province;
    
    if (hasMinimumFields) {
      // Set new timeout to geocode after 1.5 seconds of no typing
      geocodeTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Auto-geocoding triggered by address change');
        geocodeAddress();
      }, 1500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [formData.address, formData.city, formData.province, formData.barangay, autoGeocodeEnabled, loading]);

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
            <p className="text-xs text-gray-500 mt-1">
              {autoGeocodeEnabled 
                ? 'Map will auto-update 1.5 seconds after you stop typing' 
                : 'Fill in the address fields, then click "Find Location Now" to set coordinates'}
            </p>
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setAutoGeocodeEnabled(false);
                geocodeAddress();
              }}
              disabled={isGeocoding || !formData.address || !formData.city || !formData.province}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGeocoding ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Finding Location...</span>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Find Location Now</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoGeocode"
                checked={autoGeocodeEnabled}
                onChange={(e) => setAutoGeocodeEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="autoGeocode" className="text-sm text-gray-700 cursor-pointer">
                Auto-update map when address changes
              </label>
            </div>
            {autoGeocodeEnabled && (
              <span className="text-xs text-blue-600 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Enabled</span>
              </span>
            )}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
              <p className="text-sm text-gray-600">Use "Find Location on Map" button above or click on the map to set the location</p>
            </div>
          </div>
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
