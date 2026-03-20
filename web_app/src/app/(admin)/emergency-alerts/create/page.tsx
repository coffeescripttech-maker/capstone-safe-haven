'use client';

// Create Alert Page - Create new emergency alert

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { alertsApi, handleApiError } from '@/lib/safehaven-api';
import { AlertType, AlertSeverity } from '@/types/safehaven';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  AlertTriangle, 
  MapPin, 
  Radio, 
  FileText, 
  Info,
  Save,
  X,
  Cloud,
  Flame,
  Waves,
  Mountain,
  Zap
} from 'lucide-react';

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function CreateAlertPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [autoGeocodeEnabled, setAutoGeocodeEnabled] = useState(true);
  const geocodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'typhoon' as AlertType,
    severity: 'moderate' as AlertSeverity,
    location: '',
    latitude: '',
    longitude: '',
    radius: '10',
    actionRequired: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Debug: Check token before submission
    const token = localStorage.getItem('safehaven_token');
    const tokenTime = localStorage.getItem('safehaven_token_time');
    console.log('🔍 Token check before submit:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenTime: tokenTime ? new Date(parseInt(tokenTime)).toISOString() : 'none',
      tokenAge: tokenTime ? `${Math.floor((Date.now() - parseInt(tokenTime)) / 1000 / 60)} minutes` : 'unknown'
    });

    try {
      setIsSubmitting(true);

      const alertData = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        radius: parseFloat(formData.radius),
      };

      console.log('📤 Submitting alert data:', alertData);

      const response = await alertsApi.create(alertData);

      if (response.status === 'success') {
        const newAlertId = response.data.id;
        
        // Auto-broadcast the alert
        try {
          await alertsApi.broadcast(newAlertId);
          toast.success('Alert created and broadcasted successfully!');
        } catch (broadcastError) {
          console.error('Broadcast failed:', broadcastError);
          toast.success('Alert created, but broadcast failed. You can broadcast it manually from the alert details page.');
        }
        
        router.push('/emergency-alerts');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    console.log('📍 Location selected:', { lat, lng });
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
    
    // Reverse geocode to get address from coordinates
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) return;

      console.log('🔄 Reverse geocoding coordinates:', { lat, lng });

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
        
        const feature = data.features[0];
        const placeName = feature.place_name || feature.text || '';

        // Temporarily disable auto-geocoding to prevent loop
        const wasAutoEnabled = autoGeocodeEnabled;
        if (wasAutoEnabled) {
          setAutoGeocodeEnabled(false);
        }

        // Update location field with reverse geocoded address
        setFormData(prev => ({
          ...prev,
          location: placeName,
        }));

        console.log('📝 Updated location field:', placeName);
        toast.success('Location address updated from map');

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
    if (!formData.location || formData.location.trim().length < 3) {
      if (!autoGeocodeEnabled) {
        toast.error('Please enter a location address');
      }
      return;
    }

    const fullAddress = `${formData.location}, Philippines`;
    
    try {
      setIsGeocoding(true);
      console.log('🔍 Geocoding address:', fullAddress);

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) {
        toast.error('Mapbox token not configured');
        return;
      }

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
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        if (!autoGeocodeEnabled) {
          toast.success(`Location found: ${placeName}`);
        }
      } else {
        if (!autoGeocodeEnabled) {
          toast.error('Location not found. Please try a different address or set the location manually on the map.');
        }
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      if (!autoGeocodeEnabled) {
        toast.error('Failed to geocode address. Please set the location manually on the map.');
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Auto-geocode when location field changes (with debounce)
  useEffect(() => {
    if (!autoGeocodeEnabled) return;

    // Clear existing timeout
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // Check if we have minimum required field
    const hasMinimumField = formData.location && formData.location.trim().length >= 3;
    
    if (hasMinimumField) {
      // Set new timeout to geocode after 1.5 seconds of no typing
      geocodeTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Auto-geocoding triggered by location change');
        geocodeAddress();
      }, 1500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, [formData.location, autoGeocodeEnabled]);

  const getAlertTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'typhoon': return <Cloud className="w-5 h-5" />;
      case 'fire': return <Flame className="w-5 h-5" />;
      case 'flood': return <Waves className="w-5 h-5" />;
      case 'earthquake': return <Mountain className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Alerts
        </button>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Alert</h1>
            <p className="text-gray-600 mt-1">
              Create and broadcast an emergency alert to all users
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-brand-600" />
            Alert Title <span className="text-error-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            placeholder="e.g., Typhoon Warning - Signal No. 3"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-brand-600" />
            Description <span className="text-error-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            placeholder="Provide detailed information about the emergency..."
            required
          />
        </div>

        {/* Type and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              {getAlertTypeIcon(formData.type)}
              Alert Type <span className="text-error-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AlertType })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              required
            >
              <option value="typhoon">🌀 Typhoon</option>
              <option value="earthquake">🏔️ Earthquake</option>
              <option value="flood">🌊 Flood</option>
              <option value="fire">🔥 Fire</option>
              <option value="landslide">⛰️ Landslide</option>
              <option value="tsunami">🌊 Tsunami</option>
              <option value="other">⚠️ Other</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 text-error-600" />
              Severity Level <span className="text-error-500">*</span>
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              required
            >
              <option value="low">🟢 Low</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            placeholder="e.g., Metro Manila, Quezon City"
          />
          <p className="text-xs text-gray-500 mt-1">
            {autoGeocodeEnabled 
              ? 'Map will auto-update 1.5 seconds after you stop typing' 
              : 'Fill in the location, then click "Find Location Now" to set coordinates'}
          </p>
        </div>

        {/* Find Location Now Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setAutoGeocodeEnabled(false);
              geocodeAddress();
            }}
            disabled={isGeocoding || !formData.location || formData.location.trim().length < 3}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
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

        {/* Auto-geocode Toggle */}
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
              Auto-update map when location changes
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

        {/* Map Picker */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Select Location on Map
          </label>
          <p className="text-sm text-gray-600 mb-2">Click on the map to set the alert location</p>
          <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
            <MapPicker
              latitude={formData.latitude ? parseFloat(formData.latitude) : 14.5995}
              longitude={formData.longitude ? parseFloat(formData.longitude) : 120.9842}
              radius={parseFloat(formData.radius) || 10}
              onLocationChange={handleLocationSelect}
            />
          </div>
        </div>

        {/* Coordinates (Auto-filled from map or geocoding) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              placeholder="Click map or use Find Location"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              placeholder="Click map or use Find Location"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Radio className="w-4 h-4 text-brand-600" />
              Radius (km)
            </label>
            <input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              placeholder="10"
            />
          </div>
        </div>

        {/* Action Required */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 text-warning-600" />
            Action Required
          </label>
          <textarea
            value={formData.actionRequired}
            onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            placeholder="What should people do? e.g., Evacuate to nearest shelter, Stay indoors..."
          />
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-info-50 to-brand-50 border-2 border-info-200 rounded-xl p-4 shadow-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-info-100 rounded-lg">
                <Info className="h-5 w-5 text-info-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-info-900 mb-1">
                Broadcasting Information
              </h3>
              <p className="text-sm text-info-700">
                This alert will be immediately broadcasted to all mobile app users via push notifications.
                Users within the specified radius will receive priority notifications.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create & Broadcast Alert
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
