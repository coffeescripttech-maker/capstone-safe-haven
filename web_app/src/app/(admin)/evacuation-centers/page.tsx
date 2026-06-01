'use client';

import { useState, useEffect } from 'react';
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
  TrendingUp
} from 'lucide-react';

interface Center {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  occupancyPercentage: number;
  isFull: boolean;
  facilities: string[] | string;
  contactPerson: string;
  contactNumber: string;
  isActive: boolean | number;
  createdAt: string;
  updatedAt: string;
}

export default function CentersListPage() {
  const router = useRouter();
  const [centers, setCenters] = useState<Center[]>([]);
  const [totalCount, setTotalCount] = useState(0);
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
      const response = await centersApi.getAll({ limit: 100 });
      
      if (response.status === 'success') {
        const centersData = response.data?.data || response.data?.centers || response.data || [];
        const total = response.data?.total || 0;

        console.log({centersData, total});
        setCenters(Array.isArray(centersData) ? centersData : []);
        setTotalCount(total);
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
    
    const isActive = typeof center.isActive === 'boolean' ? center.isActive : center.isActive === 1;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && isActive) ||
      (statusFilter === 'inactive' && !isActive);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: totalCount || centers.length,
    active: centers.filter(c => typeof c.isActive === 'boolean' ? c.isActive : c.isActive === 1).length,
    inactive: centers.filter(c => typeof c.isActive === 'boolean' ? !c.isActive : c.isActive === 0).length,
    totalCapacity: centers.reduce((sum, c) => sum + c.capacity, 0),
    totalOccupancy: centers.reduce((sum, c) => sum + (c.currentOccupancy || 0), 0),
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-storm-50/10 to-gray-50 p-6">
      {/* Header with Glass Morphism */}
      <div className="mb-8 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-storm-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-storm-500 to-storm-700 rounded-2xl flex items-center justify-center shadow-lg shadow-storm-500/30 animate-pulse-slow">
                <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-storm-700 to-gray-900 bg-clip-text text-transparent mb-1">
                  Evacuation Centers
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-storm-500" />
                  Manage evacuation centers and monitor capacity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadCenters(true)}
                disabled={isRefreshing}
                className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh</span>
              </button>
              <button
                onClick={() => router.push('/evacuation-centers/create')}
                className="px-6 py-2.5 bg-gradient-to-r from-storm-500 to-storm-600 text-white rounded-xl hover:from-storm-600 hover:to-storm-700 transition-all flex items-center gap-2 shadow-lg shadow-storm-500/30 hover:shadow-xl hover:shadow-storm-500/40 font-semibold hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Add Center
              </button>
            </div>
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

      {/* Filters and Search with Glass Morphism */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/50">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Filters & Search</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Search Centers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or address..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md font-medium"
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="inactive">❌ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Centers List with Glass Morphism */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/50">
        {filteredCenters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-bold mb-2">No centers found</p>
            <p className="text-gray-500 text-sm mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first evacuation center to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => router.push('/evacuation-centers/create')}
                className="px-6 py-2.5 bg-gradient-to-r from-storm-500 to-storm-600 text-white rounded-xl hover:from-storm-600 hover:to-storm-700 transition-all inline-flex items-center gap-2 shadow-lg shadow-storm-500/30 hover:shadow-xl hover:shadow-storm-500/40 font-semibold hover:scale-105 active:scale-95"
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
                    ? ((center.currentOccupancy || 0) / center.capacity * 100).toFixed(0)
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
                              {center.currentOccupancy || 0} / {center.capacity}
                            </div>
                            <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${getOccupancyColor(center.currentOccupancy || 0, center.capacity)}`}>
                              {occupancyPercent}% full
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-900">{center.contactPerson || '-'}</div>
                            <div className="text-xs text-gray-500 mt-1">{center.contactNumber || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
                          (typeof center.isActive === 'boolean' ? center.isActive : center.isActive === 1)
                            ? 'bg-success-100 text-success-700 border-success-200' 
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {(typeof center.isActive === 'boolean' ? center.isActive : center.isActive === 1) ? (
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
                            className="p-2.5 text-brand-600 hover:bg-brand-50 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/evacuation-centers/${center.id}/edit`)}
                            className="p-2.5 text-success-600 hover:bg-success-50 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
                            title="Edit Center"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(center.id)}
                            className="p-2.5 text-error-600 hover:bg-error-50 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
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
          <span className="font-semibold text-gray-900">{totalCount || centers.length}</span> centers
        </div>
      )}
    </div>
  );
}

// Stat Card Component with Stunning Visuals
function StatCard({ title, value, icon, gradient }: any) {
  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/50 overflow-hidden group cursor-pointer hover:scale-105">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            {icon}
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</h3>
        <p className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">{value}</p>
      </div>
      
      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full`}></div>
    </div>
  );
}
