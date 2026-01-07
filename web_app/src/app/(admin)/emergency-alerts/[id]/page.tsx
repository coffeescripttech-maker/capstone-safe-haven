'use client';

// Alert Details Page - View single alert details

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import { alertsApi, handleApiError } from '@/lib/safehaven-api';
import { AlertType, AlertSeverity } from '@/types/safehaven';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// Dynamically import MapViewer to avoid SSR issues
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AlertDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadAlert();
    }
  }, [id]);

  const loadAlert = async () => {
    try {
      setIsLoading(true);
      const response = await alertsApi.getById(parseInt(id));
      if (response.status === 'success') {
        console.log('📋 Alert data loaded:', response.data);
        console.log('🎯 Radius value:', response.data.radius, 'Type:', typeof response.data.radius);
        setAlert(response.data);
      }
    } catch (error) {
      toast.error(handleApiError(error));
      router.push('/emergency-alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!confirm('Broadcast this alert to all users? This will send push notifications to mobile devices.')) return;

    try {
      setIsBroadcasting(true);
      const response = await alertsApi.broadcast(parseInt(id));
      
      if (response.status === 'success') {
        setBroadcastResult(response.data);
        setShowBroadcastModal(true);
        toast.success('Alert broadcasted successfully!');
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await alertsApi.delete(parseInt(id));
      toast.success('Alert deleted successfully');
      router.push('/emergency-alerts');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: AlertType) => {
    switch (type) {
      case 'typhoon': return 'bg-blue-100 text-blue-800';
      case 'earthquake': return 'bg-orange-100 text-orange-800';
      case 'flood': return 'bg-cyan-100 text-cyan-800';
      case 'fire': return 'bg-red-100 text-red-800';
      case 'landslide': return 'bg-yellow-100 text-yellow-800';
      case 'tsunami': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Alert not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Alerts
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{alert.title}</h1>
            <p className="text-gray-600 mt-1">
              Created {format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/emergency-alerts/${id}/edit`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Edit
            </button>
            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isBroadcasting ? 'Broadcasting...' : 'Broadcast'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Alert Details */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Type and Severity */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(alert.type)}`}>
              {alert.type}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
              {alert.severity}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              alert.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {alert.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <p className="text-gray-900 whitespace-pre-wrap">{alert.description}</p>
        </div>

        {/* Location */}
        {alert.location && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Affected Areas</label>
            <p className="text-gray-900">{alert.location}</p>
          </div>
        )}

        {/* Coordinates */}
        {(alert.latitude || alert.longitude) && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <p className="text-gray-900">{alert.latitude || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <p className="text-gray-900">{alert.longitude || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Radius (km)</label>
              <p className="text-gray-900">{alert.radius || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
            <p className="text-gray-900">{format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
            <p className="text-gray-900">{format(new Date(alert.updatedAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
      </div>

      {/* Map Preview (if coordinates available) */}
      {alert.latitude && alert.longitude && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h2>
          <div className="rounded-lg overflow-hidden border border-gray-300">
            <MapViewer
              latitude={alert.latitude}
              longitude={alert.longitude}
              radius={alert.radius}
              title={alert.title}
            />
          </div>
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <div>📍 Coordinates: {Number(alert.latitude).toFixed(6)}, {Number(alert.longitude).toFixed(6)}</div>
            {alert.radius && <div>🎯 Affected Radius: {alert.radius} km</div>}
          </div>
        </div>
      )}

      {/* Broadcast Results Modal */}
      {showBroadcastModal && broadcastResult && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 99999 }} onClick={() => setShowBroadcastModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Broadcast Results</h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Total Recipients */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total Recipients</div>
                <div className="text-2xl font-bold text-blue-900">{broadcastResult.total_recipients || 0}</div>
              </div>

              {/* Push Notifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Push Sent</div>
                  <div className="text-xl font-bold text-green-900">{broadcastResult.push_sent || 0}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">Push Failed</div>
                  <div className="text-xl font-bold text-red-900">{broadcastResult.push_failed || 0}</div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">SMS Sent</div>
                  <div className="text-xl font-bold text-green-900">{broadcastResult.sms_sent || 0}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">SMS Failed</div>
                  <div className="text-xl font-bold text-red-900">{broadcastResult.sms_failed || 0}</div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 font-medium">Success Rate</div>
                <div className="text-xl font-bold text-gray-900">
                  {broadcastResult.total_recipients > 0
                    ? Math.round(((broadcastResult.push_sent + broadcastResult.sms_sent) / broadcastResult.total_recipients) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowBroadcastModal(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
