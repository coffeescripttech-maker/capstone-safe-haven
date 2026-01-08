'use client';

// Incident Details Page - View and manage single incident

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { incidentsApi, handleApiError } from '@/lib/safehaven-api';
import { IncidentType, IncidentSeverity, IncidentStatus } from '@/types/safehaven';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';

// Dynamically import MapViewer
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

interface Incident {
  id: number;
  userId: number;
  incidentType: IncidentType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function IncidentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('pending');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadIncident();
    }
  }, [id]);

  const loadIncident = async () => {
    try {
      setIsLoading(true);
      const response = await incidentsApi.getById(parseInt(id));
      if (response.status === 'success') {
        setIncident(response.data);
        setNewStatus(response.data.status);
      }
    } catch (error) {
      toast.error(handleApiError(error));
      router.push('/incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!incident) return;

    try {
      setIsUpdating(true);
      await incidentsApi.updateStatus(incident.id, newStatus);
      toast.success('Status updated successfully');
      loadIncident();
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case 'damage': return '🏚️';
      case 'injury': return '🚑';
      case 'missing_person': return '🔍';
      case 'hazard': return '⚠️';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Incident not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Incidents
        </button>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <span className="text-4xl">{getTypeIcon(incident.incidentType)}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
              <p className="text-gray-600 mt-1">
                Reported {format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Incident Details</h2>

            {/* Type and Severity */}
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  {incident.incidentType.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(incident.status)}`}>
                  {incident.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <p className="text-gray-900 whitespace-pre-wrap">{incident.description}</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <p className="text-gray-900">{incident.address || 'No address provided'}</p>
              {(incident.latitude !== null && incident.latitude !== undefined && 
                incident.longitude !== null && incident.longitude !== undefined) ? (
                <p className="text-sm text-gray-500 mt-1">
                  Coordinates: {Number(incident.latitude).toFixed(6)}, {Number(incident.longitude).toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No coordinates available</p>
              )}
            </div>
          </div>

          {/* Photos */}
          {incident.photos && incident.photos.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos ({incident.photos.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {incident.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo}
                      alt={`Incident photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {(incident.latitude !== null && incident.latitude !== undefined && 
            incident.longitude !== null && incident.longitude !== undefined) ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h2>
              <div className="rounded-lg overflow-hidden border border-gray-300">
                <MapViewer
                  latitude={Number(incident.latitude)}
                  longitude={Number(incident.longitude)}
                  title={incident.title}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h2>
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-8 text-center">
                <p className="text-gray-500">No location coordinates available</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reporter Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">
                  {incident.user ? `${incident.user.firstName} ${incident.user.lastName}` : 'Unknown'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{incident.user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{incident.user?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || newStatus === incident.status}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reported</label>
                <p className="text-gray-900 text-sm">
                  {format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900 text-sm">
                  {format(new Date(incident.updatedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedPhoto}
              alt="Incident photo"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
