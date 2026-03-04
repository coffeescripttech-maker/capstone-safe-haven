'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { incidentsApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Home,
  Ambulance,
  UserX,
  AlertOctagon,
  FileQuestion,
  Flame
} from 'lucide-react';
import MapViewer from '@/components/MapViewer';

interface Incident {
  id: number;
  userId: number;
  incidentType: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: string;
  status: string;
  photos?: string[];
  assignedTo?: number;
  createdAt: string;
  updatedAt: string;
  userName?: string;
  userPhone?: string;
}

export default function IncidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    try {
      setIsLoading(true);
      const response = await incidentsApi.getById(parseInt(incidentId));
      
      if (response.status === 'success' && response.data) {
        setIncident(response.data);
        setNewStatus(response.data.status);
      }
    } catch (error) {
      console.error('Error loading incident:', error);
      toast.error(handleApiError(error));
      router.push('/incidents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!incident || newStatus === incident.status) return;

    try {
      setIsUpdating(true);
      await incidentsApi.updateStatus(incident.id, newStatus);
      toast.success('Incident status updated successfully');
      loadIncident();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moderate': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'low': return 'bg-success-100 text-success-700 border-success-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'in_progress': return 'bg-info-100 text-info-700 border-info-200';
      case 'resolved': return 'bg-success-100 text-success-700 border-success-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'damage': return <Home className="w-5 h-5" />;
      case 'injury': return <Ambulance className="w-5 h-5" />;
      case 'missing_person': return <UserX className="w-5 h-5" />;
      case 'hazard': return <AlertOctagon className="w-5 h-5" />;
      case 'fire': return <Flame className="w-5 h-5" />;
      default: return <FileQuestion className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Incident not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/incidents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Incidents
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-orange-500" />
              Incident Report #{incident.id}
            </h1>
            <p className="text-gray-600 mt-1">View and manage incident details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getSeverityColor(incident.severity)}`}>
                  {getTypeIcon(incident.incidentType)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{incident.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${getSeverityColor(incident.severity)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {incident.severity}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">{incident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident Type</p>
                  <p className="text-gray-900 font-medium capitalize">{incident.incidentType.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Reported</p>
                  <p className="text-gray-900 font-medium">{format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Card */}
          {incident.latitude && incident.longitude && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Incident Location
              </h3>
              
              <div className="mb-4">
                <MapViewer
                  latitude={Number(incident.latitude)}
                  longitude={Number(incident.longitude)}
                  markers={[
                    {
                      latitude: Number(incident.latitude),
                      longitude: Number(incident.longitude),
                      title: `Incident #${incident.id}`,
                      description: incident.title,
                      color: '#f97316'
                    }
                  ]}
                  height="400px"
                />
              </div>

              {incident.address && (
                <div className="flex items-start gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <p>{incident.address}</p>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          )}

          {/* Photos Card */}
          {incident.photos && incident.photos.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-orange-500" />
                Photos ({incident.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {incident.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={photo}
                      alt={`Incident photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Reporter Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-gray-900 font-medium">{incident.userName || 'Unknown'}</p>
              </div>
              {incident.userPhone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <a
                    href={`tel:${incident.userPhone}`}
                    className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {incident.userPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Update Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                  <option value="pending">⏳ Pending</option>
                  <option value="in_progress">🔄 In Progress</option>
                  <option value="resolved">✅ Resolved</option>
                  <option value="closed">❌ Closed</option>
                </select>
              </div>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating || newStatus === incident.status}
                className="w-full px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
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

          {/* Timeline Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Incident Reported</p>
                  <p className="text-sm text-gray-500">{format(new Date(incident.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              {incident.updatedAt !== incident.createdAt && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-info-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-info-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">{format(new Date(incident.updatedAt), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
