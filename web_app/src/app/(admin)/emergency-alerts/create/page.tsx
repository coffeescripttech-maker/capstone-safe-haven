'use client';

// Create Alert Page - Create new emergency alert

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { alertsApi, handleApiError } from '@/lib/safehaven-api';
import { AlertType, AlertSeverity } from '@/types/safehaven';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamically import MapPicker to avoid SSR issues
const MapPicker = dynamic(() => import('@/components/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

export default function CreateAlertPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Alerts
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Alert</h1>
        <p className="text-gray-600 mt-1">
          Create and broadcast an emergency alert to all users
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alert Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Typhoon Warning - Signal No. 3"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed information about the emergency..."
            required
          />
        </div>

        {/* Type and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as AlertType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="typhoon">Typhoon</option>
              <option value="earthquake">Earthquake</option>
              <option value="flood">Flood</option>
              <option value="fire">Fire</option>
              <option value="landslide">Landslide</option>
              <option value="tsunami">Tsunami</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as AlertSeverity })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Metro Manila, Quezon City"
          />
        </div>

        {/* Map Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Location on Map
          </label>
          <MapPicker
            latitude={formData.latitude ? parseFloat(formData.latitude) : 14.5995}
            longitude={formData.longitude ? parseFloat(formData.longitude) : 120.9842}
            radius={parseFloat(formData.radius) || 10}
            onLocationChange={(lat, lng) => {
              setFormData({
                ...formData,
                latitude: lat.toString(),
                longitude: lng.toString()
              });
            }}
          />
        </div>

        {/* Coordinates (Read-only, auto-filled from map) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Click map to set"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude
            </label>
            <input
              type="text"
              value={formData.longitude}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Click map to set"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Radius (km)
            </label>
            <input
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>
        </div>

        {/* Action Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action Required
          </label>
          <textarea
            value={formData.actionRequired}
            onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What should people do? e.g., Evacuate to nearest shelter, Stay indoors..."
          />
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Broadcasting Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  This alert will be immediately broadcasted to all mobile app users via push notifications.
                  Users within the specified radius will receive priority notifications.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create & Broadcast Alert'}
          </button>
        </div>
      </form>
    </div>
  );
}
