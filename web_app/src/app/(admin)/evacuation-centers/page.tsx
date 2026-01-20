'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { centersApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import {
  Building2,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Search,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  RefreshCw,
  TrendingUp,
  Home,
  Activity
} from 'lucide-react';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const response = await centersApi.getAll();
      
      if (response.status === 'success') {
        const centersData = response.data?.centers || response.data || [];
        setCenters(Array.isArray(centersData) ? centersData : []);
      }
    } catch (error) {
      console.error('Error loading centers:', error);
      toast.error(handleApiError(error));
      setCenters([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this evacuation center?')) {
      return;
    }

    try {
      await centersApi.delete(id);
      toast.success('Center deleted successfully');
      loadCenters(true);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      center.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && center.is_active) ||
      (statusFilter === 'inactive' && !center.is_active);
    
    return matchesSearch && matchesStatus;
  });

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

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percent = (occupancy / capacity) * 100;
    if (percent >= 90) return 'text-error-600 bg-error-50';
    if (percent >= 70) return 'text-warning-600 bg-warning-50';
    return 'text-success-600 bg-success-50';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading evacuation centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-storm-500" />
              Evacuation Centers
            </h1>
            <p className="text-gray-600 mt-1">Manage evacuation centers and monitor capacity</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadCenters(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/evacuation-centers/create')}
              className="px-6 py-2.5 bg-gradient-to-r from-storm-500 to-storm-600 text-white rounded-lg hover:from-storm-600 hover:to-storm-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add Center
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Centers"
          value={stats.total}
          icon={<Building2 className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Inactive"
          value={stats.inactive}
          icon={<XCircle className="w-6 h-6" />}
          gradient="from-gray-500 to-gray-600"
        />
        <StatCard
          title="Total Capacity"
          value={stats.totalCapacity}
          icon={<Users className="w-6 h-6" />}
          gradient="from-info-500 to-info-600"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-warning-500 to-warning-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Centers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or address..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Centers List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {filteredCenters.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No centers found</p>
            <p className="text-gray-400 text-sm mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first evacuation center to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => router.push('/evacuation-centers/create')}
                className="px-6 py-2.5 bg-gradient-to-r from-storm-500 to-storm-600 text-white rounded-lg hover:from-storm-600 hover:to-storm-700 transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add First Center
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Center Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                    <tr key={center.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-storm-500 to-storm-600 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                              {center.name}
                            </div>
                            {facilitiesText && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {facilitiesText}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-900">{center.address}</div>
                            {center.latitude && center.longitude && (
                              <div className="text-xs text-gray-500 mt-1">
                                {Number(center.latitude).toFixed(4)}, {Number(center.longitude).toFixed(4)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {center.current_occupancy || 0} / {center.capacity}
                            </div>
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getOccupancyColor(center.current_occupancy || 0, center.capacity)}`}>
                              {occupancyPercent}% full
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-900">{center.contact_person || '-'}</div>
                            <div className="text-xs text-gray-500 mt-1">{center.contact_number || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          center.is_active 
                            ? 'bg-success-100 text-success-700 border-success-200' 
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {center.is_active ? (
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/evacuation-centers/${center.id}`)}
                            className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/evacuation-centers/${center.id}/edit`)}
                            className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-all"
                            title="Edit Center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(center.id)}
                            className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-all"
                            title="Delete Center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredCenters.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredCenters.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{centers.length}</span> centers
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, gradient }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
