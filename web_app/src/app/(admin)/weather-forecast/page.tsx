'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp,
  RefreshCw,
  Loader2,
  Calendar,
  Thermometer,
  Eye,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { weatherApi, handleApiError } from '@/lib/safehaven-api';

interface WeatherForecast {
  id: number;
  location: string;
  forecast_time: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  precipitation_probability: number;
  weather_condition: string;
  alert_triggered: boolean;
  advance_notice_hours: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  created_at: string;
}

interface ForecastAlert {
  id: number;
  alert_id: number;
  forecast_id: number;
  alert_title: string;
  alert_type: string;
  severity: string;
  advance_notice_hours: number;
  triggered_at: string;
  status: 'pending' | 'sent' | 'cancelled';
}

export default function WeatherForecastPage() {
  const [forecasts, setForecasts] = useState<WeatherForecast[]>([]);
  const [alerts, setAlerts] = useState<ForecastAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      // Fetch weather forecasts using weatherApi
      const forecastResponse = await weatherApi.getForecasts();
      if (forecastResponse.status === 'success') {
        setForecasts(forecastResponse.data || []);
      }

      // Fetch forecast-triggered alerts using weatherApi
      const alertsResponse = await weatherApi.getForecastAlerts();
      if (alertsResponse.status === 'success') {
        setAlerts(alertsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading forecast data:', error);
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData(true);
    toast.success('Refreshing forecast data...');
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes('rain') || lower.includes('storm')) return <CloudRain className="w-5 h-5" />;
    if (lower.includes('cloud')) return <Cloud className="w-5 h-5" />;
    if (lower.includes('wind')) return <Wind className="w-5 h-5" />;
    if (lower.includes('thunder')) return <Zap className="w-5 h-5" />;
    return <Cloud className="w-5 h-5" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getSeverityGradient = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'moderate': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPrecipitationColor = (probability: number) => {
    if (probability >= 70) return 'text-red-600';
    if (probability >= 50) return 'text-orange-600';
    if (probability >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredForecasts = forecasts.filter(forecast => {
    if (selectedLocation !== 'all' && forecast.location !== selectedLocation) return false;
    if (selectedSeverity !== 'all' && forecast.severity !== selectedSeverity) return false;
    return true;
  });

  const locations = Array.from(new Set(forecasts.map(f => f.location)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading weather forecast data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-electric-50/10 to-gray-50 p-6">
      {/* Header with Glass Morphism */}
      <div className="mb-8 relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-electric-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-info-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-electric-500 to-electric-700 rounded-2xl flex items-center justify-center shadow-lg shadow-electric-500/30 animate-pulse-slow">
                <Cloud className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-electric-700 to-gray-900 bg-clip-text text-transparent mb-1">
                  Weather Forecast Monitoring
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-electric-500" />
                  Predictive weather alerts with advance notice hours
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-5 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Forecasts"
          value={forecasts.length}
          icon={<Cloud className="w-6 h-6" />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="High Risk"
          value={forecasts.filter(f => f.precipitation_probability >= 70).length}
          icon={<AlertTriangle className="w-6 h-6" />}
          gradient="from-red-500 to-red-600"
        />
        <StatCard
          title="Alerts Triggered"
          value={forecasts.filter(f => f.alert_triggered).length}
          icon={<Zap className="w-6 h-6" />}
          gradient="from-orange-500 to-orange-600"
        />
        <StatCard
          title="Locations Monitored"
          value={locations.length}
          icon={<MapPin className="w-6 h-6" />}
          gradient="from-green-500 to-green-600"
        />
      </div>

      {/* Filters with Glass Morphism */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-white/50 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-electric-600 rounded-xl flex items-center justify-center shadow-md">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Filters & Location</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-transparent transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md font-medium"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-electric-500 focus:border-transparent transition-all bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md font-medium"
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

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredForecasts.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Cloud className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg font-bold mb-2">No forecast data available</p>
            <p className="text-gray-500 text-sm">Check back later for weather predictions</p>
          </div>
        ) : (
          filteredForecasts.map((forecast) => (
            <div
              key={forecast.id}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${getSeverityGradient(forecast.severity)} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(forecast.weather_condition)}
                    <div>
                      <h3 className="font-bold text-lg">{forecast.location}</h3>
                      <p className="text-sm opacity-90">{forecast.weather_condition}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-sm`}>
                    {forecast.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Advance Notice */}
                {forecast.advance_notice_hours > 0 && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        {forecast.advance_notice_hours} hour{forecast.advance_notice_hours > 1 ? 's' : ''} advance notice
                      </span>
                    </div>
                    <p className="text-sm text-orange-600 mt-1">
                      Alert will be sent before the weather event
                    </p>
                  </div>
                )}

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Thermometer className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Temperature</p>
                      <p className="font-bold text-gray-900">{forecast.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Humidity</p>
                      <p className="font-bold text-gray-900">{forecast.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Wind className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Wind Speed</p>
                      <p className="font-bold text-gray-900">{forecast.wind_speed} km/h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <CloudRain className={`w-5 h-5 ${getPrecipitationColor(forecast.precipitation_probability)}`} />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Rain Chance</p>
                      <p className={`font-bold ${getPrecipitationColor(forecast.precipitation_probability)}`}>
                        {forecast.precipitation_probability}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Forecast Time */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Forecast: {format(new Date(forecast.forecast_time), 'MMM d, h:mm a')}</span>
                  </div>
                  {forecast.alert_triggered && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-100 text-success-700 rounded-full text-xs font-semibold border border-success-200">
                      <Zap className="w-3 h-3" />
                      Alert Sent
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Forecast-Triggered Alerts */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Recent Forecast-Triggered Alerts
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Alerts automatically created based on weather predictions
          </p>
        </div>
        <div className="overflow-x-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-bold mb-1">No forecast-triggered alerts yet</p>
              <p className="text-gray-500 text-sm">Alerts will appear here when weather conditions trigger them</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Alert</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Advance Notice</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Triggered</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{alert.alert_title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-info-100 text-info-700 rounded-full text-xs font-semibold border border-info-200">
                        {alert.alert_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                        <Clock className="w-4 h-4 text-orange-500" />
                        {alert.advance_notice_hours}h
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(alert.triggered_at), 'MMM d, h:mm a')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                        alert.status === 'sent' ? 'bg-success-100 text-success-700 border-success-200' :
                        alert.status === 'pending' ? 'bg-warning-100 text-warning-700 border-warning-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-xl">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-info-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-info-900 mb-1">
              About Predictive Weather Alerts
            </p>
            <p className="text-sm text-info-700">
              The system monitors weather forecasts and automatically creates alerts with advance notice hours. 
              For example, if there's a 70% chance of heavy rain in 1 hour, an alert will be sent to affected users. 
              This feature is only available for weather-related events (typhoon, flood, storm) and not for sudden events like earthquakes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, gradient }: any) {
  return (
    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/50 overflow-hidden group hover:scale-105">
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
