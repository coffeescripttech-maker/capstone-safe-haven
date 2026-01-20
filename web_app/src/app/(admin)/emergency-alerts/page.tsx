'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { alertsApi, handleApiError } from '@/lib/safehaven-api';
import { AlertType, AlertSeverity } from '@/types/safehaven';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Search,
  CloudRain,
  Flame,
  Waves,
  Mountain,
  Wind,
  AlertOctagon,
  Calendar,
  MapPin,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  isActive?: boolean;
}

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | AlertType>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const response = await alertsApi.getAll();
      if (response.status === 'success') {
        setAlerts(response.data || []);
      }
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      await alertsApi.delete(id);
      toast.success('Alert deleted successfully');
      loadAlerts(true);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moderate': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'low': return 'bg-success-100 text-success-700 border-success-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityGradient = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'from-emergency-500 to-emergency-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'moderate': return 'from-warning-500 to-warning-600';
      case 'low': return 'from-success-500 to-success-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'typhoon': return <Wind className="w-4 h-4" />;
      case 'earthquake': return <Mountain className="w-4 h-4" />;
      case 'flood': return <Waves className="w-4 h-4" />;
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'tsunami': return <Waves className="w-4 h-4" />;
      default: return <AlertOctagon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AlertType) => {
    switch (type) {
      case 'typhoon': return 'bg-storm-100 text-storm-700 border-storm-200';
      case 'earthquake': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'flood': return 'bg-info-100 text-info-700 border-info-200';
      case 'fire': return 'bg-emergency-100 text-emergency-700 border-emergency-200';
      case 'tsunami': return 'bg-info-100 text-info-700 border-info-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter !== 'all' && alert.type !== filter) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (searchQuery && !alert.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !alert.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading alerts...</p>
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
              <AlertTriangle className="w-8 h-8 text-emergency-500" />
              Emergency Alerts
            </h1>
            <p className="text-gray-600 mt-1">Create and manage disaster alerts for your community</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAlerts(true)}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/emergency-alerts/create')}
              className="px-6 py-2.5 bg-gradient-to-r from-emergency-500 to-emergency-600 text-white rounded-lg hover:from-emergency-600 hover:to-emergency-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Alert
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Alerts"
          value={alerts.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Critical"
          value={alerts.filter(a => a.severity === 'critical').length}
          icon={<AlertOctagon className="w-6 h-6" />}
          gradient="from-emergency-500 to-emergency-600"
        />
        <StatCard
          title="High Priority"
          value={alerts.filter(a => a.severity === 'high').length}
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Active Today"
          value={alerts.filter(a => {
            const today = new Date();
            const alertDate = new Date(a.createdAt);
            return alertDate.toDateString() === today.toDateString();
          }).length}
          icon={<Calendar className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Alerts
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="all">All Types</option>
              <option value="typhoon">🌪️ Typhoon</option>
              <option value="earthquake">🏔️ Earthquake</option>
              <option value="flood">🌊 Flood</option>
              <option value="fire">🔥 Fire</option>
              <option value="landslide">⛰️ Landslide</option>
              <option value="tsunami">🌊 Tsunami</option>
              <option value="other">⚠️ Other</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="all">All Severities</option>
              <option value="critical">🔴 Critical</option>
              <option value="high">🟠 High</option>
              <option value="moderate">🟡 Moderate</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No alerts found</p>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery || filter !== 'all' || severityFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first emergency alert to get started'}
            </p>
            {!searchQuery && filter === 'all' && severityFilter === 'all' && (
              <button
                onClick={() => router.push('/emergency-alerts/create')}
                className="px-6 py-2.5 bg-gradient-to-r from-emergency-500 to-emergency-600 text-white rounded-lg hover:from-emergency-600 hover:to-emergency-700 transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create First Alert
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Alert Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getSeverityGradient(alert.severity)} flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {alert.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {alert.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${getTypeColor(alert.type)}`}>
                        {getTypeIcon(alert.type)}
                        {alert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {alert.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(alert.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/emergency-alerts/${alert.id}`)}
                          className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/emergency-alerts/${alert.id}/edit`)}
                          className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-all"
                          title="Edit Alert"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-all"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredAlerts.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredAlerts.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{alerts.length}</span> alerts
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
