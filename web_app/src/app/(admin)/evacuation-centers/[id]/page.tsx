'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import MapViewer from '@/components/MapViewer';

interface EvacuationCenter {
  id: number;
  name: string;
  address: string;
  capacity: number;
  current_occupancy: number;
  contact_number: string;
  facilities: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
      router.push('/evacuation-centers');
    } catch (err) {
      console.error('Error deleting center:', err);
      setError(handleApiError(err));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading center details...</p>
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

  const occupancyPercentage = center.capacity > 0 
    ? Math.round((center.current_occupancy / center.capacity) * 100)
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/evacuation-centers')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
          >
            ← Back to Centers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{center.name}</h1>
          <p className="text-gray-600 mt-1">{center.address}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/evacuation-centers/${centerId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Capacity</div>
          <div className="text-3xl font-bold text-gray-900">{center.capacity}</div>
          <div className="text-sm text-gray-500 mt-1">Total capacity</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Current Occupancy</div>
          <div className="text-3xl font-bold text-gray-900">{center.current_occupancy}</div>
          <div className="text-sm text-gray-500 mt-1">{occupancyPercentage}% occupied</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <div className="mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              center.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {center.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Center Information</h2>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Contact Number</div>
              <div className="text-gray-900 font-medium">
                {center.contact_number || 'Not provided'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Facilities</div>
              <div className="text-gray-900">
                {center.facilities || 'Not specified'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Coordinates</div>
              <div className="text-gray-900 font-mono text-sm">
                {center.latitude !== null && center.longitude !== null
                  ? `${Number(center.latitude).toFixed(6)}, ${Number(center.longitude).toFixed(6)}`
                  : 'Not available'}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Created</div>
              <div className="text-gray-900">
                {new Date(center.created_at).toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Last Updated</div>
              <div className="text-gray-900">
                {new Date(center.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h2>
          {center.latitude !== null && center.longitude !== null ? (
            <MapViewer
              latitude={Number(center.latitude)}
              longitude={Number(center.longitude)}
              title={center.name}
              description={center.address}
            />
          ) : (
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Location not available</p>
            </div>
          )}
        </div>
      </div>

      {occupancyPercentage > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Status</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {center.current_occupancy} / {center.capacity} occupied
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {occupancyPercentage}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{ width: `${occupancyPercentage}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                  occupancyPercentage >= 90
                    ? 'bg-red-500'
                    : occupancyPercentage >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
