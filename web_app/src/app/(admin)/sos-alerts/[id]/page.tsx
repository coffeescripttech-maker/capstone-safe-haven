'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { sosApi, handleApiError } from '@/lib/safehaven-api';
import MapViewer from '@/components/MapViewer';
import toast from 'react-hot-toast';

interface SOSAlert {
  id: number;
  userId: number;
  latitude: number | null;
  longitude: number | null;
  message: string;
  user_info: any;
  status: string;
  priority: string;
  responder_id: number | null;
  response_time: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  responder_first_name: string | null;
  responder_last_name: string | null;
}

export default function SOSAlertDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
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
      const response = await sosApi.getById(id);
      
      if (response.status === 'success' && response.data) {
        setAlert(response.data);
        setNewStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error loading SOS alert:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      setIsUpdating(true);
      await sosApi.updateStatus(id, newStatus, notes);
      toast.success('Status updated successfully');
      loadAlert();
      setNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      sent: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      responding: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return badges[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">SOS alert not found</p>
        <button
          onClick={() => router.push('/sos-alerts')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to SOS Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push('/sos-alerts')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to SOS Alerts
          </button>
          <h1 className="text-2xl font-bold text-gray-900">SOS Alert #{alert.id}</h1>
          <p className="text-gray-600">Emergency alert details and response</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityBadge(alert.priority)}`}>
            {alert.priority} Priority
          </span>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(alert.status)}`}>
            {alert.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Alert Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <p className="mt-1 text-gray-900">{alert.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-gray-900">{formatDate(alert.created_at)}</p>
                </div>
                {alert.response_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Response Time</label>
                    <p className="mt-1 text-gray-900">{formatDate(alert.response_time)}</p>
                  </div>
                )}
              </div>
              {alert.resolution_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolution Notes</label>
                  <p className="mt-1 text-gray-900">{alert.resolution_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-gray-900">{alert.first_name} {alert.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-gray-900">{alert.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-gray-900">{alert.email}</p>
              </div>
              {alert.user_info && typeof alert.user_info === 'object' && (
                <>
                  {alert.user_info.bloodType && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Blood Type</label>
                      <p className="mt-1 text-gray-900">{alert.user_info.bloodType}</p>
                    </div>
                  )}
                  {alert.user_info.medicalConditions && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Medical Conditions</label>
                      <p className="mt-1 text-gray-900">{alert.user_info.medicalConditions}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Location Map */}
          {alert.latitude && alert.longitude && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Location</h2>
              <MapViewer
                latitude={Number(alert.latitude)}
                longitude={Number(alert.longitude)}
                title={`SOS Alert #${alert.id}`}
                description={alert.message}
              />
              <p className="mt-2 text-sm text-gray-600">
                Coordinates: {Number(alert.latitude).toFixed(6)}, {Number(alert.longitude).toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="sent">Sent</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="responding">Responding</option>
                  <option value="resolved">Resolved</option>
                  <option value="cancelled">Cancelled</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add notes about the response..."
                />
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === alert.status}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Responder Info */}
          {alert.responder_first_name && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Responder</h2>
              <p className="text-gray-900">
                {alert.responder_first_name} {alert.responder_last_name}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href={`tel:${alert.phone}`}
                className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Call User
              </a>
              <a
                href={`sms:${alert.phone}`}
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Send SMS
              </a>
              {alert.latitude && alert.longitude && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Get Directions
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
