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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/incidents')}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-600 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Incidents</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Incident Report #{incident.id}
                </h1>
                <p className="text-gray-600 mt-1">Detailed incident information and response management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${getSeverityColor(incident.severity)}`}>
                  {getTypeIcon(incident.incidentType)}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{incident.title}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border shadow-sm ${getSeverityColor(incident.severity)}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border shadow-sm ${getStatusColor(incident.status)}`}>
                      {getStatusIcon(incident.status)}
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                      {getTypeIcon(incident.incidentType)}
                      {incident.incidentType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{incident.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-600 mb-1 font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Incident Type
                  </p>
                  <p className="text-gray-900 font-semibold capitalize">{incident.incidentType.replace('_', ' ')}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-purple-600 mb-1 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Reported
                  </p>
                  <p className="text-gray-900 font-semibold">{format(new Date(incident.createdAt), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-gray-500">{format(new Date(incident.createdAt), 'h:mm a')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Card */}
          {incident.latitude && incident.longitude && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Incident Location & Route
              </h3>
              
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
                  showDirections={true}
                  height="500px"
                />
              </div>

              {incident.address && (
                <div className="flex items-start gap-3 text-gray-600 mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                  <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Incident Address</p>
                    <p className="text-gray-900">{incident.address}</p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-info-50 to-blue-50 border border-info-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-info-600 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-info-900 mb-1">Auto-Navigation Enabled</p>
                    <p className="text-sm text-info-700">
                      The map automatically shows the fastest route to the incident site. 
                      The blue line indicates the driving route for quick response.
                    </p>
                    <p className="text-xs text-info-600 mt-2">
                      💡 If your actual location is far away, a nearby response team location is used for demonstration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md font-medium"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate with Google
                </a>
              </div>
            </div>
          )}

          {/* Photos Card */}
          {incident.photos && incident.photos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                Incident Photos ({incident.photos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {incident.photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all shadow-sm hover:shadow-lg group">
                    <img
                      src={photo}
                      alt={`Incident photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                        Photo {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reporter Info Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              Reporter Information
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Name</p>
                <p className="text-gray-900 font-semibold text-lg">{incident.userName || 'Unknown'}</p>
              </div>
              {incident.userPhone && (
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 mb-2 uppercase tracking-wide font-medium">Phone Number</p>
                  <a
                    href={`tel:${incident.userPhone}`}
                    className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                      <Phone className="w-4 h-4 text-brand-600" />
                    </div>
                    {incident.userPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Update Status
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Change Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-medium"
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
                className="w-full px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-semibold"
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

          {/* Timeline Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-success-50 to-green-50 rounded-xl border border-success-200">
                <div className="w-10 h-10 rounded-xl bg-success-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-success-900">Incident Reported</p>
                  <p className="text-sm text-success-700 font-medium">{format(new Date(incident.createdAt), 'MMM d, yyyy')}</p>
                  <p className="text-xs text-success-600">{format(new Date(incident.createdAt), 'h:mm a')}</p>
                </div>
              </div>
              {incident.updatedAt !== incident.createdAt && (
                <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-info-50 to-blue-50 rounded-xl border border-info-200">
                  <div className="w-10 h-10 rounded-xl bg-info-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-info-900">Last Updated</p>
                    <p className="text-sm text-info-700 font-medium">{format(new Date(incident.updatedAt), 'MMM d, yyyy')}</p>
                    <p className="text-xs text-info-600">{format(new Date(incident.updatedAt), 'h:mm a')}</p>
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
