'use client';

// Incidents List Page - View and manage all incident reports

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { incidentsApi, handleApiError } from '@/lib/safehaven-api';
import { IncidentType, IncidentSeverity, IncidentStatus } from '@/types/safehaven';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

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

export default function IncidentsListPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      
      if (filters.type) params.type = filters.type;
      if (filters.severity) params.severity = filters.severity;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      console.log('🔍 Fetching incidents with params:', params);
      const response = await incidentsApi.getAll(params);
      console.log('📦 Full API response:', JSON.stringify(response, null, 2));
      
      if (response.status === 'success' && response.data) {
        // Backend returns: { status: 'success', data: { data: [...], total, page, limit } }
        const paginatedData = response.data;
        console.log('📊 Paginated data:', paginatedData);
        
        // Extract the incidents array
        const incidentsArray = paginatedData.data || [];
        console.log('✅ Incidents array:', incidentsArray.length, 'items');
        
        setIncidents(Array.isArray(incidentsArray) ? incidentsArray : []);
      } else {
        console.warn('⚠️ Unexpected response structure');
        setIncidents([]);
      }
    } catch (error) {
      console.error('❌ Error loading incidents:', error);
      toast.error(handleApiError(error));
      setIncidents([]);
    } finally {
      setIsLoading(false);
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

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
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

  const stats = {
    total: Array.isArray(incidents) ? incidents.length : 0,
    pending: Array.isArray(incidents) ? incidents.filter(i => i.status === 'pending').length : 0,
    inProgress: Array.isArray(incidents) ? incidents.filter(i => i.status === 'in_progress').length : 0,
    resolved: Array.isArray(incidents) ? incidents.filter(i => i.status === 'resolved').length : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incident Reports</h1>
          <p className="text-gray-600 mt-1">
            View and manage incident reports from users
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Incidents</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-6">
          <div className="text-sm text-yellow-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <div className="text-sm text-blue-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="text-sm text-green-600">Resolved</div>
          <div className="text-2xl font-bold text-green-900 mt-1">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="damage">Damage</option>
              <option value="injury">Injury</option>
              <option value="missing_person">Missing Person</option>
              <option value="hazard">Hazard</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : !Array.isArray(incidents) || incidents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No incidents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getTypeIcon(incident.incidentType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {incident.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {incident.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {incident.user ? `${incident.user.firstName} ${incident.user.lastName}` : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {incident.user?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {incident.address || 'No address'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(incident.latitude !== null && incident.latitude !== undefined && 
                          incident.longitude !== null && incident.longitude !== undefined)
                          ? `${Number(incident.latitude).toFixed(4)}, ${Number(incident.longitude).toFixed(4)}`
                          : 'No coordinates'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/incidents/${incident.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
