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
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Radio, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Users,
  MessageSquare,
  TrendingUp,
  X,
  Cloud,
  Flame,
  Waves,
  Mountain,
  Zap
} from 'lucide-react';

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
      case 'critical': return 'bg-gradient-to-r from-error-500 to-error-600 text-white';
      case 'high': return 'bg-gradient-to-r from-fire-500 to-fire-600 text-white';
      case 'moderate': return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white';
      case 'low': return 'bg-gradient-to-r from-success-500 to-success-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getTypeColor = (type: AlertType) => {
    switch (type) {
      case 'typhoon': return 'bg-gradient-to-r from-storm-500 to-storm-600 text-white';
      case 'earthquake': return 'bg-gradient-to-r from-fire-500 to-fire-600 text-white';
      case 'flood': return 'bg-gradient-to-r from-info-500 to-info-600 text-white';
      case 'fire': return 'bg-gradient-to-r from-error-500 to-error-600 text-white';
      case 'landslide': return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white';
      case 'tsunami': return 'bg-gradient-to-r from-brand-500 to-brand-600 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
        <p className="text-gray-600 font-medium">Loading alert details...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">Alert not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Alerts
        </button>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shadow-lg ${getTypeColor(alert.type)}`}>
              {getAlertTypeIcon(alert.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{alert.title}</h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created {format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => router.push(`/emergency-alerts/${id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success-600 to-success-700 text-white rounded-lg hover:from-success-700 hover:to-success-800 transition-all shadow-md hover:shadow-lg"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isBroadcasting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Broadcast
                </>
              )}
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-error-600 to-error-700 text-white rounded-lg hover:from-error-700 hover:to-error-800 transition-all shadow-md hover:shadow-lg"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Alert Details */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
        {/* Type and Severity */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md ${getTypeColor(alert.type)}`}>
              {getAlertTypeIcon(alert.type)}
              {alert.type}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md ${getSeverityColor(alert.severity)}`}>
              <AlertTriangle className="w-4 h-4" />
              {alert.severity}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg shadow-md ${
              alert.isActive 
                ? 'bg-gradient-to-r from-success-500 to-success-600 text-white' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
            }`}>
              {alert.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {alert.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-r from-gray-50 to-brand-50 rounded-lg p-4 border border-gray-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 text-brand-600" />
            Description
          </label>
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{alert.description}</p>
        </div>

        {/* Location */}
        {alert.location && (
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              Affected Areas
            </label>
            <p className="text-gray-900 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">{alert.location}</p>
          </div>
        )}

        {/* Coordinates */}
        {(alert.latitude || alert.longitude) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4 border border-brand-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-1">
                <MapPin className="w-4 h-4" />
                Latitude
              </label>
              <p className="text-brand-900 font-mono text-lg">{alert.latitude || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4 border border-brand-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-1">
                <MapPin className="w-4 h-4" />
                Longitude
              </label>
              <p className="text-brand-900 font-mono text-lg">{alert.longitude || 'N/A'}</p>
            </div>
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-4 border border-brand-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-brand-700 mb-1">
                <Radio className="w-4 h-4" />
                Radius (km)
              </label>
              <p className="text-brand-900 font-mono text-lg">{alert.radius || 'N/A'}</p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              Created At
            </label>
            <p className="text-gray-900 font-medium">{format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
              <Calendar className="w-4 h-4 text-gray-600" />
              Last Updated
            </label>
            <p className="text-gray-900 font-medium">{format(new Date(alert.updatedAt), 'MMM d, yyyy h:mm a')}</p>
          </div>
        </div>
      </div>

      {/* Map Preview (if coordinates available) */}
      {alert.latitude && alert.longitude && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <MapPin className="w-5 h-5 text-brand-600" />
            Location Map
          </h2>
          <div className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
            <MapViewer
              latitude={alert.latitude}
              longitude={alert.longitude}
              radius={alert.radius}
              title={alert.title}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span className="font-medium">Coordinates:</span>
              <span className="font-mono">{Number(alert.latitude).toFixed(6)}, {Number(alert.longitude).toFixed(6)}</span>
            </div>
            {alert.radius && (
              <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
                <Radio className="w-4 h-4 text-brand-600" />
                <span className="font-medium">Affected Radius:</span>
                <span className="font-mono">{alert.radius} km</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Results Modal */}
      {showBroadcastModal && broadcastResult && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 99999 }} onClick={() => setShowBroadcastModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Broadcast Results</h3>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Total Recipients */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-xl p-5 border-2 border-brand-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-brand-600" />
                  <div className="text-sm text-brand-700 font-semibold">Total Recipients</div>
                </div>
                <div className="text-3xl font-bold text-brand-900">{broadcastResult.total_recipients || 0}</div>
              </div>

              {/* Push Notifications */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-4 border border-success-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                    <div className="text-xs text-success-700 font-semibold">Push Sent</div>
                  </div>
                  <div className="text-2xl font-bold text-success-900">{broadcastResult.push_sent || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-error-50 to-error-100 rounded-xl p-4 border border-error-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-error-600" />
                    <div className="text-xs text-error-700 font-semibold">Push Failed</div>
                  </div>
                  <div className="text-2xl font-bold text-error-900">{broadcastResult.push_failed || 0}</div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-4 border border-success-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-success-600" />
                    <div className="text-xs text-success-700 font-semibold">SMS Sent</div>
                  </div>
                  <div className="text-2xl font-bold text-success-900">{broadcastResult.sms_sent || 0}</div>
                </div>
                <div className="bg-gradient-to-br from-error-50 to-error-100 rounded-xl p-4 border border-error-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-error-600" />
                    <div className="text-xs text-error-700 font-semibold">SMS Failed</div>
                  </div>
                  <div className="text-2xl font-bold text-error-900">{broadcastResult.sms_failed || 0}</div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <div className="text-sm text-gray-700 font-semibold">Success Rate</div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {broadcastResult.total_recipients > 0
                    ? Math.round(((broadcastResult.push_sent + broadcastResult.sms_sent) / broadcastResult.total_recipients) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-lg hover:from-brand-700 hover:to-brand-800 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
