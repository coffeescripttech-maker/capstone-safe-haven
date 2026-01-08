'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';

interface Center {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  facilities: string[] | string;
  contact_person: string;
  contact_number: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CentersListPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      setIsLoading(true);
      const response = await centersApi.getAll();
      
      console.log('📦 Centers API response:', response);
      
      if (response.status === 'success') {
        // Backend returns: { status: 'success', data: { centers: [...], total, page, limit } }
        const centersData = response.data?.centers || response.data || [];
        console.log('✅ Centers data:', centersData);
        setCenters(Array.isArray(centersData) ? centersData : []);
      }
    } catch (error) {
      console.error('Error loading centers:', error);
      toast.error(handleApiError(error));
      setCenters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this evacuation center?')) {
      return;
    }

    try {
      await centersApi.delete(id);
      toast.success('Center deleted successfully');
      loadCenters();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const filteredCenters = centers.filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: centers.length,
    active: centers.filter(c => c.is_active).length,
    inactive: centers.filter(c => !c.is_active).length,
    totalCapacity: centers.reduce((sum, c) => sum + c.capacity, 0),
    totalOccupancy: centers.reduce((sum, c) => sum + (c.current_occupancy || 0), 0),
  };

  const occupancyRate = stats.totalCapacity > 0 
    ? ((stats.totalOccupancy / stats.totalCapacity) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evacuation Centers</h1>
          <p className="text-gray-600 mt-1">
            Manage evacuation centers and their capacity
          </p>
        </div>
        <button
          onClick={() => router.push('/evacuation-centers/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Center
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Centers</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600">Active</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.active}</div>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Inactive</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.inactive}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="text-sm text-blue-600">Total Capacity</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.totalCapacity}</div>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-6">
          <div className="text-sm text-orange-600">Occupancy Rate</div>
          <div className="text-2xl font-bold text-orange-900 mt-1">{occupancyRate}%</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or address..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Centers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'No centers found matching your search' : 'No evacuation centers found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Center Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCenters.map((center) => {
                  const occupancyPercent = center.capacity > 0 
                    ? ((center.current_occupancy || 0) / center.capacity * 100).toFixed(0)
                    : '0';
                  
                  const facilitiesText = Array.isArray(center.facilities) 
                    ? center.facilities.join(', ') 
                    : center.facilities || '';
                  
                  return (
                    <tr key={center.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{center.name}</div>
                        <div className="text-sm text-gray-500">{facilitiesText}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{center.address}</div>
                        <div className="text-xs text-gray-500">
                          {center.latitude && center.longitude
                            ? `${Number(center.latitude).toFixed(4)}, ${Number(center.longitude).toFixed(4)}`
                            : 'No coordinates'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {center.current_occupancy || 0} / {center.capacity}
                        </div>
                        <div className="text-xs text-gray-500">{occupancyPercent}% full</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{center.contact_person || '-'}</div>
                        <div className="text-sm text-gray-500">{center.contact_number || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          center.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {center.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => router.push(`/evacuation-centers/${center.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/evacuation-centers/${center.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(center.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
