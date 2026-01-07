'use client';

// SafeHaven Admin Dashboard Home Page

import React, { useEffect, useState } from 'react';
import { useSafeHavenAuth } from '@/context/SafeHavenAuthContext';
import { DashboardStats } from '@/types/safehaven';
import { alertsApi, incidentsApi, sosApi } from '@/lib/safehaven-api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useSafeHavenAuth();
  const [stats, setStats] = useState<Partial<DashboardStats>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch data from multiple endpoints
      const [alertsResponse, incidentsResponse] = await Promise.all([
        alertsApi.getAll({ limit: 5 }),
        incidentsApi.getAll({ limit: 5 }),
      ]);

      setStats({
        recentAlerts: alertsResponse.data?.alerts || [],
        recentIncidents: incidentsResponse.data?.incidents || [],
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with SafeHaven today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Alerts"
          value="0"
          icon="🚨"
          color="bg-red-500"
          trend="+0%"
        />
        <StatCard
          title="Active Incidents"
          value="0"
          icon="📋"
          color="bg-orange-500"
          trend="+0%"
        />
        <StatCard
          title="Evacuation Centers"
          value="0"
          icon="🏢"
          color="bg-blue-500"
          trend="+0%"
        />
        <StatCard
          title="Active SOS"
          value="0"
          icon="🆘"
          color="bg-purple-500"
          trend="+0%"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          {stats.recentAlerts && stats.recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {stats.recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent alerts</p>
          )}
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Incidents</h2>
          {stats.recentIncidents && stats.recentIncidents.length > 0 ? (
            <div className="space-y-3">
              {stats.recentIncidents.map((incident) => (
                <div key={incident.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(incident.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent incidents</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Create Alert"
            description="Broadcast a new disaster alert"
            icon="🚨"
            href="/alerts/create"
          />
          <QuickActionCard
            title="View Incidents"
            description="Manage incident reports"
            icon="📋"
            href="/incidents"
          />
          <QuickActionCard
            title="Manage Centers"
            description="Update evacuation centers"
            icon="🏢"
            href="/centers"
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, color, trend }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className="text-sm text-green-600 font-medium">{trend}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function QuickActionCard({ title, description, icon, href }: any) {
  return (
    <a
      href={href}
      className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition border border-gray-200 hover:border-blue-500"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}

// Helper Functions
function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
