'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/safehaven-api';
import { CheckCircle, XCircle, AlertTriangle, Clock, MapPin, Users, Zap } from '@/components/ui/icons';

interface PendingAlert {
  id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  affected_areas: string[];
  latitude: number;
  longitude: number;
  radius_km: number;
  created_at: string;
  trigger_data: any;
  users_targeted: number;
  rule_name: string;
}

export default function AlertAutomationPage() {
  const [pendingAlerts, setPendingAlerts] = useState<PendingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadPendingAlerts();
  }, []);

  const loadPendingAlerts = async () => {
    try {
      setLoading(true);
      const response = await adminApi.alertAutomation.getPendingAlerts(20);
      if (response.success) {
        setPendingAlerts(response.data);
        setStats({
          pending: response.data.length,
          approved: stats.approved,
          rejected: stats.rejected,
        });
      }
    } catch (error) {
      console.error('Error loading pending alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (alertId: number) => {
    try {
      setProcessing(alertId);
      const response = await adminApi.alertAutomation.approveAlert(alertId);
      if (response.success) {
        setPendingAlerts(pendingAlerts.filter(a => a.id !== alertId));
        setStats({ ...stats, pending: stats.pending - 1, approved: stats.approved + 1 });
      }
    } catch (error) {
      console.error('Error approving alert:', error);
      alert('Failed to approve alert');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (alertId: number) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      setProcessing(alertId);
      const response = await adminApi.alertAutomation.rejectAlert(alertId, reason || 'Rejected by admin');
      if (response.success) {
        setPendingAlerts(pendingAlerts.filter(a => a.id !== alertId));
        setStats({ ...stats, pending: stats.pending - 1, rejected: stats.rejected + 1 });
      }
    } catch (error) {
      console.error('Error rejecting alert:', error);
      alert('Failed to reject alert');
    } finally {
      setProcessing(null);
    }
  };

  const handleTriggerMonitoring = async () => {
    try {
      setLoading(true);
      const response = await adminApi.alertAutomation.triggerMonitoring();
      if (response.success) {
        alert(`Monitoring complete! Weather: ${response.data.weatherAlerts}, Earthquakes: ${response.data.earthquakeAlerts}`);
        loadPendingAlerts();
      }
    } catch (error) {
      console.error('Error triggering monitoring:', error);
      alert('Failed to trigger monitoring');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'auto_weather') return '🌦️';
    if (source === 'auto_earthquake') return '🌍';
    return '🤖';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alert Automation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and approve auto-generated alerts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/alert-automation/logs'}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            View Logs
          </button>
          <button
            onClick={() => window.location.href = '/alert-automation/rules'}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Manage Rules
          </button>
          <button
            onClick={handleTriggerMonitoring}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Trigger Monitoring
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Sent to users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Not sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Alerts</CardTitle>
          <CardDescription>
            Review auto-generated alerts before sending to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading alerts...</p>
            </div>
          ) : pendingAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All caught up!</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">No pending alerts to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getSourceIcon(alert.source)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {alert.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {alert.rule_name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {alert.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{alert.affected_areas.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{alert.users_targeted} users targeted</span>
                        </div>
                      </div>

                      {alert.trigger_data && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                          <strong>Trigger Data:</strong>
                          {alert.source === 'auto_weather' && alert.trigger_data.weather && (
                            <div className="mt-1 grid grid-cols-3 gap-2">
                              <span>🌡️ {alert.trigger_data.weather.temperature}°C</span>
                              <span>🌧️ {alert.trigger_data.weather.precipitation}mm</span>
                              <span>💨 {alert.trigger_data.weather.windSpeed}km/h</span>
                            </div>
                          )}
                          {alert.source === 'auto_earthquake' && alert.trigger_data.earthquake && (
                            <div className="mt-1">
                              <span>📊 M{alert.trigger_data.earthquake.magnitude.toFixed(1)}</span>
                              <span className="ml-3">📍 Depth: {alert.trigger_data.earthquake.coordinates.depth.toFixed(1)}km</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(alert.id)}
                        disabled={processing === alert.id}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(alert.id)}
                        disabled={processing === alert.id}
                        className="px-3 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
