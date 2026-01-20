'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { incidentsApi, handleApiError } from '@/lib/safehaven-api';
import { IncidentType, IncidentSeverity, IncidentStatus } from '@/types/safehaven';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  FileText,
  Filter,
  Eye,
  Loader2,
  Search,
  MapPin,
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Home,
  Ambulance,
  UserX,
  AlertOctagon,
  FileQuestion
} from 'lucide-react';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    severity: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    loadIncidents();
  }, [filters]);

  const loadIncidents = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const params: any = {};
      
      if (filters.type) params.type = filters.type;
      if (filters.severity) params.severity = filters.severity;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const response = await incidentsApi.getAll(params);
      
      if (response.status === 'success' && response.data) {
        const paginatedData = response.data;
        const incidentsArray = paginatedData.data || [];
        setIncidents(Array.isArray(incidentsArray) ? incidentsArray : []);
        
        if (silent) {
          toast.success('Incidents refreshed', { duration: 2000 });
        }
      } else {
        setIncidents([]);
      }
    } catch (error) {
      console.error('Error loading incidents:', error);
      if (!silent) {
        toast.error(handleApiError(error));
      }
      setIncidents([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case 'damage': return <Home className="w-4 h-4" />;
      case 'injury': return <Ambulance className="w-4 h-4" />;
      case 'missing_person': return <UserX className="w-4 h-4" />;
      case 'hazard': return <AlertOctagon className="w-4 h-4" />;
      default: return <FileQuestion className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: IncidentType) => {
    switch (type) {
      case 'damage': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'injury': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'missing_person': return 'bg-info-100 text-info-700 border-info-200';
      case 'hazard': return 'bg-warning-100 text-warning-700 border-warning-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'in_progress': return <TrendingUp className="w-3 h-3" />;
      case 'resolved': return <CheckCircle2 className="w-3 h-3" />;
      case 'closed': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const stats = {
    total: Array.isArray(incidents) ? incidents.length : 0,
    pending: Array.isArray(incidents) ? incidents.filter(i => i.status === 'pending').length : 0,
    inProgress: Array.isArray(incidents) ? incidents.filter(i => i.status === 'in_progress').length : 0,
    resolved: Array.isArray(incidents) ? incidents.filter(i => i.status === 'resolved').length : 0,
    critical: Array.isArray(incidents) ? incidents.filter(i => i.severity === 'critical').length : 0,
  };

  const filteredIncidents = incidents;

  if (isLoading && !incidents.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading incidents...</p>
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
              <FileText className="w-8 h-8 text-orange-500" />
              Incident Reports
            </h1>
            <p className="text-gray-600 mt-1">View and manage incident reports from the community</p>
          </div>
          <button
            onClick={() => loadIncidents(true)}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <StatCard
          title="Total Incidents"
          value={stats.total}
          icon={<FileText className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-warning-500 to-warning-600"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-info-500 to-info-600"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle2 className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
        />
        <StatCard
          title="Critical"
          value={stats.critical}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="from-emergency-500 to-emergency-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Incidents
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by title or description..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Types</option>
              <option value="damage">🏚️ Damage</option>
              <option value="injury">🚑 Injury</option>
              <option value="missing_person">🔍 Missing Person</option>
              <option value="hazard">⚠️ Hazard</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="resolved">✅ Resolved</option>
              <option value="closed">❌ Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No incidents found</p>
            <p className="text-gray-400 text-sm">
              {filters.search || filters.type || filters.severity || filters.status
                ? 'Try adjusting your filters'
                : 'Incidents reported by users will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Incident Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getSeverityGradient(incident.severity)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {incident.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {incident.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {incident.user ? `${incident.user.firstName} ${incident.user.lastName}` : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {incident.user?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getTypeColor(incident.incidentType)}`}>
                        {getTypeIcon(incident.incidentType)}
                        {incident.incidentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getStatusColor(incident.status)}`}>
                        {getStatusIcon(incident.status)}
                        {incident.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate">{incident.address || 'No address'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(incident.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/incidents/${incident.id}`)}
                        className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredIncidents.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredIncidents.length}</span> incident{filteredIncidents.length !== 1 ? 's' : ''}
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
