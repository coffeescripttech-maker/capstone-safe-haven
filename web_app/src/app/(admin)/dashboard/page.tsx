'use client';

import React, { useEffect, useState } from 'react';
import { useSafeHavenAuth } from '@/context/SafeHavenAuthContext';
import { adminApi, alertsApi, incidentsApi } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  AlertTriangle,
  FileText,
  Building2,
  AlertOctagon,
  Users,
  TrendingUp,
  RefreshCw,
  Bell,
  MapPin,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Flame,
  CloudRain,
  Zap,
  Shield
} from 'lucide-react';

interface DashboardStats {
  alerts: {
    total: number;
    active: number;
  };
  incidents: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
  };
  centers: {
    total: number;
    active: number;
  };
  sos: {
    active: number;
  };
  users: {
    total: number;
    admins: number;
    users: number;
  };
  today: {
    alerts: number;
    incidents: number;
    sos: number;
    users: number;
  };
}

export default function DashboardPage() {
  const { user } = useSafeHavenAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const [statsResponse, alertsResponse, incidentsResponse] = await Promise.all([
        adminApi.getStats(),
        alertsApi.getAll({ limit: 5 }),
        incidentsApi.getAll({ limit: 5 }),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      if (alertsResponse.status === 'success') {
        setRecentAlerts(alertsResponse.data || []);
      }
      
      if (incidentsResponse.status === 'success') {
        const incidents = incidentsResponse.data?.data || incidentsResponse.data || [];
        setRecentIncidents(Array.isArray(incidents) ? incidents : []);
      }
      
      setLastUpdated(new Date());
      
      if (silent) {
        toast.success('Dashboard refreshed', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (!silent) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-brand-500" />
              Welcome back, {user?.name || 'Admin'}!
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Here's what's happening with SafeHaven today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-4 h-4" />
              {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Emergency Alerts"
          value={stats?.alerts.total || 0}
          subtitle={`${stats?.alerts.active || 0} currently active`}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="from-emergency-500 to-emergency-600"
          trend={stats?.today.alerts ? `+${stats.today.alerts} today` : 'No new alerts'}
          trendUp={!!stats?.today.alerts}
          href="/emergency-alerts"
        />
        <StatCard
          title="Active Incidents"
          value={stats?.incidents.pending || 0}
          subtitle={`${stats?.incidents.total || 0} total reported`}
          icon={<FileText className="w-6 h-6" />}
          gradient="from-orange-500 to-orange-600"
          trend={stats?.today.incidents ? `+${stats.today.incidents} today` : 'No new incidents'}
          trendUp={!!stats?.today.incidents}
          href="/incidents"
        />
        <StatCard
          title="Evacuation Centers"
          value={stats?.centers.active || 0}
          subtitle={`${stats?.centers.total || 0} total centers`}
          icon={<Building2 className="w-6 h-6" />}
          gradient="from-storm-500 to-storm-600"
          trend={`${stats?.centers.active || 0} operational`}
          trendUp={true}
          href="/evacuation-centers"
        />
        <StatCard
          title="SOS Alerts"
          value={stats?.sos.active || 0}
          subtitle="Last 24 hours"
          icon={<AlertOctagon className="w-6 h-6" />}
          gradient="from-error-500 to-error-600"
          trend={stats?.today.sos ? `+${stats.today.sos} today` : 'No active SOS'}
          trendUp={!!stats?.today.sos}
          href="/sos-alerts"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          title="Incident Status"
          icon={<Activity className="w-5 h-5" />}
          iconColor="text-info-500"
          iconBg="bg-info-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Pending"
              value={stats?.incidents.pending || 0}
              color="text-warning-600"
              bgColor="bg-warning-50"
            />
            <StatusRow
              label="In Progress"
              value={stats?.incidents.in_progress || 0}
              color="text-info-600"
              bgColor="bg-info-50"
            />
            <StatusRow
              label="Resolved"
              value={stats?.incidents.resolved || 0}
              color="text-success-600"
              bgColor="bg-success-50"
            />
          </div>
        </InfoCard>

        <InfoCard
          title="User Statistics"
          icon={<Users className="w-5 h-5" />}
          iconColor="text-brand-500"
          iconBg="bg-brand-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Total Users"
              value={stats?.users.total || 0}
              color="text-gray-900"
              bgColor="bg-gray-50"
            />
            <StatusRow
              label="Administrators"
              value={stats?.users.admins || 0}
              color="text-brand-600"
              bgColor="bg-brand-50"
            />
            <StatusRow
              label="New Today"
              value={stats?.today.users || 0}
              color="text-success-600"
              bgColor="bg-success-50"
              prefix="+"
            />
          </div>
        </InfoCard>

        <InfoCard
          title="Today's Activity"
          icon={<TrendingUp className="w-5 h-5" />}
          iconColor="text-success-500"
          iconBg="bg-success-50"
        >
          <div className="space-y-3">
            <StatusRow
              label="Alerts Created"
              value={stats?.today.alerts || 0}
              color="text-emergency-600"
              bgColor="bg-emergency-50"
            />
            <StatusRow
              label="Incidents Reported"
              value={stats?.today.incidents || 0}
              color="text-orange-600"
              bgColor="bg-orange-50"
            />
            <StatusRow
              label="SOS Alerts"
              value={stats?.today.sos || 0}
              color="text-error-600"
              bgColor="bg-error-50"
            />
          </div>
        </InfoCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Alerts */}
        <ActivityCard
          title="Recent Alerts"
          icon={<Bell className="w-5 h-5" />}
          viewAllHref="/emergency-alerts"
        >
          {recentAlerts && recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.slice(0, 5).map((alert) => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <EmptyState message="No recent alerts" icon={<Bell className="w-12 h-12" />} />
          )}
        </ActivityCard>

        {/* Recent Incidents */}
        <ActivityCard
          title="Recent Incidents"
          icon={<FileText className="w-5 h-5" />}
          viewAllHref="/incidents"
        >
          {recentIncidents && recentIncidents.length > 0 ? (
            <div className="space-y-3">
              {recentIncidents.slice(0, 5).map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <EmptyState message="No recent incidents" icon={<FileText className="w-12 h-12" />} />
          )}
        </ActivityCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-electric-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Create Alert"
            description="Broadcast emergency alert"
            icon={<AlertTriangle className="w-8 h-8" />}
            href="/emergency-alerts/create"
            color="from-emergency-500 to-emergency-600"
          />
          <QuickActionCard
            title="View Incidents"
            description="Manage incident reports"
            icon={<FileText className="w-8 h-8" />}
            href="/incidents"
            color="from-orange-500 to-orange-600"
          />
          <QuickActionCard
            title="Manage Centers"
            description="Update evacuation centers"
            icon={<Building2 className="w-8 h-8" />}
            href="/evacuation-centers"
            color="from-storm-500 to-storm-600"
          />
          <QuickActionCard
            title="View SOS"
            description="Monitor emergency SOS"
            icon={<AlertOctagon className="w-8 h-8" />}
            href="/sos-alerts"
            color="from-error-500 to-error-600"
          />
        </div>
      </div>
    </div>
  );
}

// Enhanced Components
function StatCard({ title, value, subtitle, icon, gradient, trend, trendUp, href }: any) {
  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group-hover:border-brand-200">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${trendUp ? 'text-success-600' : 'text-gray-500'}`}>
            {trendUp && <TrendingUp className="w-4 h-4" />}
            <span>{trend}</span>
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </Link>
  );
}

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

function StatusRow({ label, value, color, bgColor, prefix = '' }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`${color} font-bold text-lg px-3 py-1 ${bgColor} rounded-lg`}>
        {prefix}{value}
      </span>
    </div>
  );
}

function ActivityCard({ title, icon, viewAllHref, children }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 group"
        >
          View all
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function AlertItem({ alert }: any) {
  return (
    <Link
      href={`/emergency-alerts/${alert.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityGradient(alert.severity)}`}>
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {alert.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getSeverityColor(alert.severity)}`}>
              {alert.severity}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(alert.createdAt).toLocaleDateString()}
            </span>
            {alert.isActive && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-success-100 text-success-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function IncidentItem({ incident }: any) {
  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="block p-4 border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusGradient(incident.status)}`}>
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {incident.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{incident.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(incident.status)}`}>
              {incident.status?.replace('_', ' ')}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(incident.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickActionCard({ title, description, icon, href, color }: any) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-brand-200 group"
    >
      <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

function EmptyState({ message, icon }: any) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-300 mb-3 flex justify-center">
        {icon}
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}

// Helper Functions
function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-emergency-100 text-emergency-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    case 'moderate':
      return 'bg-warning-100 text-warning-700';
    case 'low':
      return 'bg-success-100 text-success-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getSeverityGradient(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-gradient-to-br from-emergency-500 to-emergency-600';
    case 'high':
      return 'bg-gradient-to-br from-orange-500 to-orange-600';
    case 'moderate':
      return 'bg-gradient-to-br from-warning-500 to-warning-600';
    case 'low':
      return 'bg-gradient-to-br from-success-500 to-success-600';
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'resolved':
      return 'bg-success-100 text-success-700';
    case 'in_progress':
      return 'bg-info-100 text-info-700';
    case 'pending':
      return 'bg-warning-100 text-warning-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getStatusGradient(status: string) {
  switch (status) {
    case 'resolved':
      return 'bg-gradient-to-br from-success-500 to-success-600';
    case 'in_progress':
      return 'bg-gradient-to-br from-info-500 to-info-600';
    case 'pending':
      return 'bg-gradient-to-br from-warning-500 to-warning-600';
    default:
      return 'bg-gradient-to-br from-gray-500 to-gray-600';
  }
}
