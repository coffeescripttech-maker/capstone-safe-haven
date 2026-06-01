'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import MapViewer from '@/components/MapViewer';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  ExternalLink,
  Building2,
  Users,
  Phone,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Calendar
} from 'lucide-react';

interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  barangay?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  isFull: boolean;
  contactPerson?: string;
  contactNumber?: string;
  facilities: string[];
  isActive: boolean | number;
  createdAt: string;
  updatedAt: string;
}

export default function EvacuationCenterDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<EvacuationCenter | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCenter();
  }, [centerId]);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const response = await centersApi.getById(Number(centerId));
      
      if (response.status === 'success' && response.data) {
        setCenter(response.data);
      }
    } catch (err) {
      console.error('Error fetching center:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this evacuation center?')) {
      return;
    }

    try {
      setDeleting(true);
      await centersApi.delete(Number(centerId));
      toast.success('Evacuation center deleted successfully');
      router.push('/evacuation-centers');
    } catch (err) {
      console.error('Error deleting center:', err);
      toast.error(handleApiError(err));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading evacuation center details...</p>
        </div>
      </div>
    );
  }

  if (error || !center) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Center not found'}
        </div>
        <button
          onClick={() => router.push('/evacuation-centers')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          ← Back to Centers
        </button>
      </div>
    );
  }

  const isActive = typeof center.isActive === 'boolean' ? center.isActive : center.isActive === 1;
  const occupancyPercentage = center.occupancyPercentage || (center.capacity > 0 
    ? Math.round((center.currentOccupancy / center.capacity) * 100)
    : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/evacuation-centers')}
          className="flex items-center gap-2 text-gray-600 hover:text-brand-600 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Centers</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-storm-500 to-storm-700 rounded-2xl flex items-center justify-center shadow-lg shadow-storm-500/30">
              <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-storm-700 to-gray-900 bg-clip-text text-transparent">
                {center.name}
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-storm-500" />
                {center.address}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/evacuation-centers/${centerId}/edit`)}
              className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <Edit className="w-4 h-4" />
              <span className="font-semibold">Edit</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2.5 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-xl hover:from-error-600 hover:to-error-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-error-500/30 hover:shadow-xl hover:shadow-error-500/40 font-semibold hover:scale-105 active:scale-95"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 font-medium">Capacity</div>
          </div>
          <div className="text-3xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{center.capacity}</div>
          <div className="text-sm text-gray-500 mt-1">Total capacity</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-info-500 to-info-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 font-medium">Current Occupancy</div>
          </div>
          <div className="text-3xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{center.currentOccupancy}</div>
          <div className="text-sm text-gray-500 mt-1">{occupancyPercentage}% occupied</div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-gradient-to-br from-success-500 to-success-600' : 'bg-gradient-to-br from-gray-500 to-gray-600'
            }`}>
              {isActive ? <CheckCircle2 className="w-6 h-6 text-white" /> : <XCircle className="w-6 h-6 text-white" />}
            </div>
            <div className="text-sm text-gray-600 font-medium">Status</div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full border ${
              isActive 
                ? 'bg-success-100 text-success-700 border-success-200' 
                : 'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {isActive ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Inactive
                </>
              )}
            </span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm text-gray-600 font-medium">Created</div>
          </div>
          <div className="text-lg font-semibold text-gray-900">{new Date(center.createdAt).toLocaleDateString()}</div>
          <div className="text-sm text-gray-500 mt-1">{new Date(center.createdAt).toLocaleTimeString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card with Navigation */}
          {center.latitude && center.longitude && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-storm-500 to-storm-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                Evacuation Center Location & Route
              </h3>
              
              <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <MapViewer
                  latitude={Number(center.latitude)}
                  longitude={Number(center.longitude)}
                  markers={[
                    {
                      latitude: Number(center.latitude),
                      longitude: Number(center.longitude),
                      title: center.name,
                      description: center.address,
                      color: '#0f766e'
                    }
                  ]}
                  showDirections={true}
                  height="500px"
                />
              </div>

              <div className="flex items-start gap-3 text-gray-600 mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                <MapPin className="w-5 h-5 text-storm-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Center Address</p>
                  <p className="text-gray-900">{center.address}</p>
                  {center.barangay && (
                    <p className="text-sm text-gray-500 mt-1">{center.barangay}, {center.city}, {center.province}</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-info-50 to-blue-50 border border-info-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-info-600 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-info-900 mb-1">Auto-Navigation Enabled</p>
                    <p className="text-sm text-info-700">
                      The map automatically shows the fastest route to the evacuation center. 
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
                  href={`https://www.google.com/maps?q=${center.latitude},${center.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`}
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

          {/* Occupancy Status Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-info-500 to-info-600 flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              Occupancy Status
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-brand-600">
                    {center.currentOccupancy} / {center.capacity} occupied
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-brand-600">
                    {occupancyPercentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200">
                <div
                  style={{ width: `${occupancyPercentage}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full transition-all duration-500 ${
                    occupancyPercentage >= 90
                      ? 'bg-gradient-to-r from-error-500 to-error-600'
                      : occupancyPercentage >= 70
                      ? 'bg-gradient-to-r from-warning-500 to-warning-600'
                      : 'bg-gradient-to-r from-success-500 to-success-600'
                  }`}
                ></div>
              </div>
              {center.isFull && (
                <div className="bg-error-50 border border-error-200 rounded-xl p-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-error-600" />
                  <p className="text-sm font-semibold text-error-900">This center is at full capacity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-storm-500 to-storm-600 flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              Contact Information
            </h3>
            <div className="space-y-4">
              {center.contactPerson && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Contact Person</p>
                  <p className="text-gray-900 font-semibold text-lg">{center.contactPerson}</p>
                </div>
              )}
              {center.contactNumber && (
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                  <p className="text-xs text-blue-600 mb-2 uppercase tracking-wide font-medium">Phone Number</p>
                  <a
                    href={`tel:${center.contactNumber}`}
                    className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-2 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                      <Phone className="w-4 h-4 text-brand-600" />
                    </div>
                    {center.contactNumber}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Facilities Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-storm-500 to-storm-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              Available Facilities
            </h3>
            <div className="space-y-2">
              {Array.isArray(center.facilities) && center.facilities.length > 0 ? (
                center.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{facility}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No facilities specified</p>
              )}
            </div>
          </div>

          {/* Coordinates Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-storm-500 to-storm-600 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              Coordinates
            </h3>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Latitude</p>
              <p className="text-gray-900 font-mono font-semibold text-lg">{Number(center.latitude).toFixed(6)}</p>
              <p className="text-xs text-gray-500 mb-1 mt-3 uppercase tracking-wide font-medium">Longitude</p>
              <p className="text-gray-900 font-mono font-semibold text-lg">{Number(center.longitude).toFixed(6)}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
