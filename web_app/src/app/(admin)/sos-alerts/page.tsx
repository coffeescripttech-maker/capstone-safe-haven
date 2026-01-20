'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sosApi, handleApiError } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  AlertOctagon,
  Filter,
  Eye,
  Loader2,
  Search,
  MapPin,
  User,
  Clock,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Activity,
  Zap,
  Timer
} from 'lucide-react';

interface SOSAlert {
  id: number;
  userId: number;
  latitude: number | null;
  longitude: number | null;
  message: string;
  user_info: any;
  status: string;
  priority: string;
  responder_id: number | null;
  response_time: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function SOSAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    acknowledged: 0,
    responding: 0,
    resolved: 0,
    critical: 0,
    avg_response_time_minutes: 0
  });

  useEffect(() => {
    loadAlerts();
    loadStatistics();
  }, [statusFilter, priorityFilter]);

  const loadAlerts = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const params: any = {};
      
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const response = await sosApi.getAll(params);
      
      if (response.status === 'success' && response.data) {
        const alertsData = response.data.alerts || [];
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
      }
    } catch (error) {
      console.error('Error loading SOS alerts:', error);
      toast.error(handleApiError(error));
      setAlerts([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await sosApi.getStatistics();
      if (response.status === 'success' && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      sent: { color: 'bg-warning-100 text-warning-700 border-warning-200', icon: Clock },
      acknowledged: { color: 'bg-info-100 text-info-700 border-info-200', icon: CheckCircle2 },
      responding: { color: 'bg-brand-100 text-brand-700 border-brand-200', icon: Activity },
      resolved: { color: 'bg-success-100 text-success-700 border-success-200', icon: CheckCircle2 },
      cancelled: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock }
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock };
  };

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { color: string; gradient: string }> = {
      low: { color: 'bg-gray-100 text-gray-700 border-gray-200', gradient: 'from-gray-500 to-gray-600' },
      medium: { color: 'bg-warning-100 text-warning-700 border-warning-200', gradient: 'from-warning-500 to-warning-600' },
      high: { color: 'bg-orange-100 text-orange-700 border-orange-200', gradient: 'from-orange-500 to-orange-600' },
      critical: { color: 'bg-error-100 text-error-700 border-error-200', gradient: 'from-error-500 to-error-600' }
    };
    return badges[priority] || { color: 'bg-gray-100 text-gray-700 border-gray-200', gradient: 'from-gray-500 to-gray-600' };
  };

  const formatResponseTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  const filteredAlerts = alerts.filter(alert => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        alert.first_name?.toLowerCase().includes(search) ||
        alert.last_name?.toLowerCase().includes(search) ||
        alert.phone?.includes(search) ||
        alert.message?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-error-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading SOS alerts...</p>
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
              <AlertOctagon className="w-8 h-8 text-error-500" />
              SOS Emergency Alerts
            </h1>
            <p className="text-gray-600 mt-1">Monitor and respond to emergency SOS alerts in real-time</p>
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
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Alerts"
          value={stats.total}
          icon={<AlertOctagon className="w-6 h-6" />}
          gradient="from-error-500 to-error-600"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-warning-500 to-warning-600"
        />
        <StatCard
          title="Responding"
          value={stats.responding}
          icon={<Activity className="w-6 h-6" />}
          gradient="from-brand-500 to-brand-600"
        />
        <StatCard
          title="Avg Response Time"
          value={formatResponseTime(stats.avg_response_time_minutes)}
          icon={<Timer className="w-6 h-6" />}
          gradient="from-info-500 to-info-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          title="Status Breakdown"
          icon={<Activity className="w-5 h-5" />}
          iconColor="text-brand-500"
          iconBg="bg-brand-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Acknowledged"
              value={stats.acknowledged}
              color="text-info-600"
              bgColor="bg-info-50"
            />
            <StatusRow
              label="Responding"
              value={stats.responding}
              color="text-brand-600"
              bgColor="bg-brand-50"
            />
            <StatusRow
              label="Resolved"
              value={stats.resolved}
              color="text-success-600"
              bgColor="bg-success-50"
            />
          </div>
        </InfoCard>

        <InfoCard
          title="Priority Levels"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconColor="text-error-500"
          iconBg="bg-error-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Critical"
              value={stats.critical}
              color="text-error-600"
              bgColor="bg-error-50"
            />
            <StatusRow
              label="High Priority"
              value={alerts.filter(a => a.priority === 'high').length}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
            <StatusRow
              label="Medium/Low"
              value={alerts.filter(a => a.priority === 'medium' || a.priority === 'low').length}
              color="text-warning-600"
              bgColor="bg-warning-50"
            />
          </div>
        </InfoCard>

        <InfoCard
          title="Response Metrics"
          icon={<Zap className="w-5 h-5" />}
          iconColor="text-electric-500"
          iconBg="bg-electric-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Active Now"
              value={stats.pending + stats.responding}
              color="text-error-600"
              bgColor="bg-error-50"
            />
            <StatusRow
              label="Resolved Today"
              value={alerts.filter(a => {
                const today = new Date();
                const alertDate = new Date(a.updated_at);
                return a.status === 'resolved' && alertDate.toDateString() === today.toDateString();
              }).length}
              color="text-success-600"
              bgColor="bg-success-50"
            />
            <StatusRow
              label="Avg Response"
              value={formatResponseTime(stats.avg_response_time_minutes)}
              color="text-info-600"
              bgColor="bg-info-50"
            />
          </div>
        </InfoCard>
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
                placeholder="Search by name, phone, or message..."
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
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Statuses</option>
              <option value="sent">⏱️ Sent</option>
              <option value="acknowledged">✅ Acknowledged</option>
              <option value="responding">🚨 Responding</option>
              <option value="resolved">✔️ Resolved</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">All Priorities</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <AlertOctagon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium mb-2">No SOS alerts found</p>
            <p className="text-gray-400 text-sm">
              {searchQuery || statusFilter || priorityFilter
                ? 'Try adjusting your filters'
                : 'No emergency SOS alerts at this time'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Alert ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
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
                {filteredAlerts.map((alert) => {
                  const statusBadge = getStatusBadge(alert.status);
                  const priorityBadge = getPriorityBadge(alert.priority);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={alert.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${priorityBadge.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                            <AlertOctagon className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            #{alert.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {alert.first_name} {alert.last_name}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Phone className="w-3 h-3" />
                              {alert.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs line-clamp-2">
                          {alert.message || 'Emergency SOS Alert'}
                        </div>
                        {alert.latitude && alert.longitude && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {Number(alert.latitude).toFixed(4)}, {Number(alert.longitude).toFixed(4)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border ${priorityBadge.color}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-900">
                              {format(new Date(alert.created_at), 'MMM d, yyyy')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(alert.created_at), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => router.push(`/sos-alerts/${alert.id}`)}
                          className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-all inline-flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Results Count */}
      {filteredAlerts.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredAlerts.length}</span> of{' '}
          <span className="font-semibold text-gray-900">{alerts.length}</span> SOS alerts
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

// Info Card Component
function InfoCard({ title, icon, iconColor, iconBg, children }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Status Row Component
function StatusRow({ label, value, color, bgColor }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`${color} font-bold text-lg px-3 py-1 ${bgColor} rounded-lg`}>
        {value}
      </span>
    </div>
  );
}
