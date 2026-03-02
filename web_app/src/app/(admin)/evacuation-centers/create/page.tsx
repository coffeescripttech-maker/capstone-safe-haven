'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function CreateCenterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [autoGeocodeEnabled, setAutoGeocodeEnabled] = useState(true);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    province: '',
    barangay: '',
    latitude: 14.5995, // Default to Manila
    longitude: 120.9842,
    capacity: '',
    facilities: '',
    contact_person: '',
    contact_number: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.capacity || !formData.city || !formData.province) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse facilities from comma-separated string to array
      const facilitiesArray = formData.facilities
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      
      const data = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        barangay: formData.barangay || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        capacity: parseInt(formData.capacity),
        facilities: facilitiesArray,
        contact_person: formData.contact_person || undefined,
        contact_number: formData.contact_number || undefined,
      };

      console.log('📤 Sending center data:', data);
      await centersApi.create(data);
      toast.success('Evacuation center created successfully');
      router.push('/evacuation-centers');
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
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
        console.log('📝 Current formData before update:', { 
          currentLat: formData.latitude, 
          currentLng: formData.longitude 
        });

        setFormData(prev => {
          const updated = {
            ...prev,
            latitude,
            longitude,
          };
          console.log('📝 Updated formData:', { 
            newLat: updated.latitude, 
            newLng: updated.longitude 
          });
          return updated;
        });

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
    if (!autoGeocodeEnabled) return;

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
  }, [formData.address, formData.city, formData.province, formData.barangay, autoGeocodeEnabled]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Centers
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Evacuation Center</h1>
        <p className="text-gray-600 mt-1">Create a new evacuation center</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Center Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Barangay Hall Evacuation Center"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full address of the evacuation center"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Province"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barangay
              </label>
              <input
                type="text"
                value={formData.barangay}
                onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Barangay"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Maximum capacity"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facilities
            </label>
            <textarea
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Comma-separated list: Restrooms, Kitchen, Medical Station, Sleeping Area"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple facilities with commas</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Name of person in charge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number
            </label>
            <input
              type="tel"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="09XXXXXXXXX or +639XXXXXXXXX"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              <p className="text-sm text-gray-600">Use "Find Location on Map" button above or click on the map to set the location</p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-300">
            <MapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              radius={5}
              onLocationChange={handleLocationSelect}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Center'}
          </button>
        </div>
      </form>
    </div>
  );
}
