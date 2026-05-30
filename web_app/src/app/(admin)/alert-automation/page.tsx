'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/safehaven-api';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  Zap, 
  Activity, 
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';

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
      case 'critical': return 'bg-error-100 text-error-700 border-error-200';
      case 'warning': return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'info': return 'bg-info-100 text-info-700 border-info-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityGradient = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-gradient-to-br from-error-500 to-error-600 text-white';
      case 'warning': return 'bg-gradient-to-br from-warning-500 to-warning-600 text-white';
      case 'info': return 'bg-gradient-to-br from-info-500 to-info-600 text-white';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600 text-white';
    }
  };

  const getSourceIcon = (source: string) => {
    if (source === 'auto_weather') return '🌦️';
    if (source === 'auto_earthquake') return '🌍';
    return '🤖';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-electric-50/10 to-gray-50 p-6">
      {/* Header with Glass Morphism */}
      <div className="mb-8 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-600 rounded-2xl flex items-center justify-center shadow-lg shadow-electric-500/30 animate-pulse-slow">
                <Zap className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-electric-700 to-gray-900 bg-clip-text text-transparent mb-1">
                  Alert Automation
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-electric-500" />
                  Review and approve auto-generated alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = '/alert-automation/logs'}
                className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Clock className="w-4 h-4" />
                <span className="font-semibold">View Logs</span>
              </button>
              <button
                onClick={() => window.location.href = '/alert-automation/rules'}
                className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <Activity className="w-4 h-4" />
                <span className="font-semibold">Manage Rules</span>
              </button>
              <button
                onClick={handleTriggerMonitoring}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-electric-500 to-electric-600 text-white rounded-xl hover:from-electric-600 hover:to-electric-700 transition-all flex items-center gap-2 shadow-lg shadow-electric-500/30 hover:shadow-xl hover:shadow-electric-500/40 disabled:opacity-50 font-semibold hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>Trigger Monitoring</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          gradient="from-warning-500 to-warning-600"
          subtitle="Awaiting review"
        />
        <StatCard
          title="Approved Today"
          value={stats.approved}
          icon={<CheckCircle className="w-6 h-6" />}
          gradient="from-success-500 to-success-600"
          subtitle="Sent to users"
        />
        <StatCard
          title="Rejected Today"
          value={stats.rejected}
          icon={<XCircle className="w-6 h-6" />}
          gradient="from-error-500 to-error-600"
          subtitle="Not sent"
        />
      </div>

      {/* Pending Alerts List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pending Alerts</h2>
              <p className="text-sm text-gray-600">Review auto-generated alerts before sending to users</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border-4 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading alerts...</p>
            </div>
          ) : pendingAlerts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-success-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending alerts to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-brand-300 transition-all duration-300 bg-white/50 backdrop-blur-sm group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${getSeverityGradient(alert.severity)}`}>
                          {getSourceIcon(alert.source)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                            {alert.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              {alert.rule_name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {alert.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-brand-500" />
                          <span className="font-medium">{alert.affected_areas.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Users className="w-4 h-4 text-brand-500" />
                          <span className="font-medium">{alert.users_targeted} users targeted</span>
                        </div>
                      </div>

                      {alert.trigger_data && (
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-sm border border-gray-200">
                          <strong className="text-gray-900 font-bold">Trigger Data:</strong>
                          {alert.source === 'auto_weather' && alert.trigger_data.weather && (
                            <div className="mt-2 grid grid-cols-3 gap-3">
                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <span>🌡️</span>
                                <span className="font-semibold">{alert.trigger_data.weather.temperature}°C</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <span>🌧️</span>
                                <span className="font-semibold">{alert.trigger_data.weather.precipitation}mm</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <span>💨</span>
                                <span className="font-semibold">{alert.trigger_data.weather.windSpeed}km/h</span>
                              </div>
                            </div>
                          )}
                          {alert.source === 'auto_earthquake' && alert.trigger_data.earthquake && (
                            <div className="mt-2 flex gap-3">
                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <span>📊</span>
                                <span className="font-semibold">M{alert.trigger_data.earthquake.magnitude.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                                <span>📍</span>
                                <span className="font-semibold">Depth: {alert.trigger_data.earthquake.coordinates.depth.toFixed(1)}km</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 ml-6">
                      <button
                        onClick={() => handleApprove(alert.id)}
                        disabled={processing === alert.id}
                        className="px-5 py-2.5 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-xl hover:from-success-600 hover:to-success-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold shadow-lg shadow-success-500/30 hover:shadow-xl hover:shadow-success-500/40 transition-all hover:scale-105 active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(alert.id)}
                        disabled={processing === alert.id}
                        className="px-5 py-2.5 border-2 border-error-500 text-error-600 rounded-xl hover:bg-error-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
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
        </div>
      </div>
    </div>
  );
}


// Stat Card Component with Stunning Visuals
function StatCard({ title, value, icon, gradient, subtitle }: any) {
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
        <p className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">{value}</p>
        <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
      </div>
      
      {/* Corner Accent */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full`}></div>
    </div>
  );
}
