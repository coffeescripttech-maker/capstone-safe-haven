'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { incidentsApi, handleApiError } from '@/lib/safehaven-api';
import { IncidentType, IncidentSeverity, IncidentStatus } from '@/types/safehaven';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  XCircle,
  Home,
  Ambulance,
  UserX,
  AlertOctagon,
  FileQuestion,
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react';

// Dynamically import MapViewer
const MapViewer = dynamic(() => import('@/components/MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  )
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
      case 'critical': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moderate': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'low': return 'bg-success-100 text-success-700 border-success-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityGradient = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical': return 'from-emergency-500 to-emergency-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'moderate': return 'from-warning-500 to-warning-600';
      case 'low': return 'from-success-500 to-success-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'in_progress': return 'bg-info-100 text-info-700 border-info-200';
      case 'resolved': return 'bg-success-100 text-success-700 border-success-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusGradient = (status: IncidentStatus) => {
    switch (status) {
      case 'pending': return 'from-warning-500 to-warning-600';
      case 'in_progress': return 'from-info-500 to-info-600';
      case 'resolved': return 'from-success-500 to-success-600';
      case 'closed': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case 'damage': return <Home className="w-5 h-5" />;
      case 'injury': return <Ambulance className="w-5 h-5" />;
      case 'missing_person': return <UserX className="w-5 h-5" />;
      case 'hazard': return <AlertOctagon className="w-5 h-5" />;
      default: return <FileQuestion className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <TrendingUp className="w-4 h-4" />;
      case 'resolved': return <CheckCircle2 className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Incident not found</p>
          <button
            onClick={() => router.push('/incidents')}
            className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-all"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Incidents
          </button>
        </div>

        {/* Title Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getSeverityGradient(incident.severity)} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
              {getTypeIcon(incident.incidentType)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{incident.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Reported {format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(incident.status)}`}>
                    {getStatusIcon(incident.status)}
                    {incident.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border ${getSeverityColor(incident.severity)}`}>
                    {incident.severity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Details */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-brand-500" />
                <h2 className="text-xl font-bold text-gray-900">Incident Details</h2>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Incident Type</label>
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getSeverityGradient(incident.severity)} flex items-center justify-center text-white shadow-md`}>
                      {getTypeIcon(incident.incidentType)}
                    </div>
                    <span className="text-gray-900 font-medium capitalize">
                      {incident.incidentType.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900 font-medium">{incident.address || 'No address provided'}</p>
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
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            {incident.photos && incident.photos.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-brand-500" />
                  <h2 className="text-xl font-bold text-gray-900">Photos ({incident.photos.length})</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {incident.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-all border-2 border-gray-200 hover:border-brand-300 shadow-sm hover:shadow-md group"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo}
                        alt={`Incident photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {(incident.latitude !== null && incident.latitude !== undefined && 
              incident.longitude !== null && incident.longitude !== undefined) ? (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <h2 className="text-xl font-bold text-gray-900">Location Map</h2>
                </div>
                <div className="rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                  <MapViewer
                    latitude={Number(incident.latitude)}
                    longitude={Number(incident.longitude)}
                    title={incident.title}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-brand-500" />
                  <h2 className="text-xl font-bold text-gray-900">Location Map</h2>
                </div>
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-12 text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No location coordinates available</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Update Status</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Status
                  </label>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(incident.status)}`}>
                    {getStatusIcon(incident.status)}
                    {incident.status.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">🔄 In Progress</option>
                    <option value="resolved">✅ Resolved</option>
                    <option value="closed">❌ Closed</option>
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || newStatus === incident.status}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Update Status
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Reporter Information */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Reporter Information</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</label>
                    <p className="text-gray-900 font-medium">
                      {incident.user ? `${incident.user.firstName} ${incident.user.lastName}` : 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-info-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                    <p className="text-gray-900 font-medium truncate">{incident.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-success-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                    <p className="text-gray-900 font-medium">{incident.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-brand-500" />
                <h2 className="text-lg font-bold text-gray-900">Timeline</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-warning-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reported</label>
                    <p className="text-gray-900 font-medium text-sm">
                      {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {format(new Date(incident.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-info-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</label>
                    <p className="text-gray-900 font-medium text-sm">
                      {format(new Date(incident.updatedAt), 'MMM d, yyyy')}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {format(new Date(incident.updatedAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 rounded-lg px-4 py-2 hover:bg-opacity-75 transition-all flex items-center gap-2 font-medium"
            >
              <X className="w-5 h-5" />
              Close
            </button>
            <img
              src={selectedPhoto}
              alt="Incident photo"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
