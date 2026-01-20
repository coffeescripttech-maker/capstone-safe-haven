'use client';

// Create Alert Page - Create new emergency alert

import React, { useState } from 'react';
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
        </div>

        {/* Map Picker */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            Select Location on Map
          </label>
          <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
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
        </div>

        {/* Coordinates (Read-only, auto-filled from map) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Latitude
            </label>
            <input
              type="text"
              value={formData.latitude}
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="Click map to set"
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
              readOnly
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              placeholder="Click map to set"
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
