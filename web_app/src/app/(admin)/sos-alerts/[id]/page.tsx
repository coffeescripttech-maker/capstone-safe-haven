'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { sosApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import MapViewer from '@/components/MapViewer';
import {
  AlertOctagon,
  ArrowLeft,
  Loader2,
  MapPin,
  User,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  Activity,
  FileText,
  Map,
  Navigation
} from 'lucide-react';

interface SOSAlert {
  id: number;
  userId: number;
  latitude: number | null;
  longitude: number | null;
  message: string;
  user_info: any;
  status: string;
  priority: string;
  target_agency: string;
  responder_id: number | null;
  response_time: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function SOSAlertDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadAlert();
    }
  }, [id]);

  const loadAlert = async () => {
    try {
      setIsLoading(true);
      const response = await sosApi.getById(parseInt(id));
      
      if (response.status === 'success' && response.data) {
        setAlert(response.data);
        setNewStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error loading SOS alert:', error);
      toast.error(handleApiError(error));
      router.push('/sos-alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === alert?.status) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setIsUpdating(true);
      await sosApi.updateStatus(parseInt(id), newStatus, notes);
      toast.success('SOS alert status updated successfully');
      await loadAlert();
      setNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      sent: { color: 'bg-warning-100 text-warning-700 border-warning-200', icon: Clock },
      acknowledged: { color: 'bg-info-100 text-info-700 border-info-200', icon: CheckCircle2 },
      responding: { color: 'bg-brand-100 text-brand-700 border-brand-200', icon: Activity },
      resolved: { color: 'bg-success-100 text-success-700 border-success-200', icon: CheckCircle2 },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock }
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { color: string }> = {
      low: { color: 'bg-gray-100 text-gray-700 border-gray-200' },
      medium: { color: 'bg-warning-100 text-warning-700 border-warning-200' },
      high: { color: 'bg-orange-100 text-orange-700 border-orange-200' },
      critical: { color: 'bg-error-100 text-error-700 border-error-200' }
    };
    return badges[priority] || { color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const getAgencyBadge = (agency: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      all: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🚨' },
      barangay: { color: 'bg-green-100 text-green-700 border-green-200', icon: '🏘️' },
      lgu: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🏛️' },
      bfp: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🚒' },
      pnp: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '👮' },
      mdrrmo: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '⚠️' }
    };
    return badges[agency] || badges.all;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-error-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading SOS alert details...</p>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertOctagon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">SOS alert not found</p>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(alert.status);
  const priorityBadge = getPriorityBadge(alert.priority);
  const agencyBadge = getAgencyBadge(alert.target_agency);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/sos-alerts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to SOS Alerts
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <AlertOctagon className="w-8 h-8 text-error-500" />
              SOS Alert #{alert.id}
            </h1>
            <p className="text-gray-600 mt-1">Emergency alert details and response management</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-error-500" />
              Alert Information
            </h2>

            <div className="space-y-4">
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Status</label>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${statusBadge.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    {alert.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Priority</label>
                  <span className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-full border ${priorityBadge.color}`}>
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Target Agency</label>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${agencyBadge.color}`}>
                    <span>{agencyBadge.icon}</span>
                    {alert.target_agency.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Emergency Message</label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-900">{alert.message || 'Emergency SOS Alert'}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Created At</label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {format(new Date(alert.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                {alert.response_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Response Time</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {format(new Date(alert.response_time), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Notes */}
              {alert.resolution_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Resolution Notes</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900">{alert.resolution_notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Information with Map */}
          {alert.latitude && alert.longitude && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                Location Information
              </h2>

              <div className="space-y-4">
                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Latitude</label>
                    <p className="text-gray-900 font-mono">{Number(alert.latitude).toFixed(6)}°</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Longitude</label>
                    <p className="text-gray-900 font-mono">{Number(alert.longitude).toFixed(6)}°</p>
                  </div>
                </div>

                {/* Interactive Map */}
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <MapViewer
                    latitude={Number(alert.latitude)}
                    longitude={Number(alert.longitude)}
                    title={`SOS Alert #${alert.id} - ${alert.first_name} ${alert.last_name}`}
                  />
                </div>

                {/* Map Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <Map className="w-4 h-4" />
                    Google Maps
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-500" />
              Update Status
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="sent">⏱️ Sent</option>
                  <option value="acknowledged">✅ Acknowledged</option>
                  <option value="responding">🚨 Responding</option>
                  <option value="resolved">✔️ Resolved</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any notes about the response or resolution..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === alert.status}
                className="w-full px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-500" />
              User Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Name</label>
                <p className="text-gray-900 font-medium">
                  {alert.first_name} {alert.last_name}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Phone</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${alert.phone}`} className="hover:text-brand-600">
                    {alert.phone}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <div className="flex items-center gap-2 text-gray-900">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${alert.email}`} className="hover:text-brand-600 break-all">
                    {alert.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>

            <div className="space-y-2">
              <a
                href={`tel:${alert.phone}`}
                className="w-full px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call User
              </a>

              <a
                href={`mailto:${alert.email}`}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email User
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
